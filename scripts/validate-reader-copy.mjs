import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const projectRoot = path.resolve('src/content/projects/komatsu36');
const decisionsPath = path.resolve('docs/editorial/komatsu36-reader-copy-decisions.yml');
const candidatesPath = path.resolve('docs/editorial/komatsu36-reader-copy-candidates.generated.md');
const errors = [];

const decisionsDocument = YAML.parse(await readFile(decisionsPath, 'utf8'));
if (decisionsDocument?.version !== 1 || !decisionsDocument?.decisions || typeof decisionsDocument.decisions !== 'object') {
  errors.push('decisions document must have version: 1 and a decisions map');
}
const decisions = decisionsDocument?.decisions || {};
const candidateText = await readFile(candidatesPath, 'utf8');
const candidateIds = [...candidateText.matchAll(/^### RCOPY-\d+ · (\S+)/gm)].map((match) => match[1]);
if (candidateIds.length === 0) errors.push('generated candidate file has no candidate headings');

const eventIds = new Set((await readdir(path.join(projectRoot, 'events')))
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.slice(0, -'.json'.length)));
const threadIds = new Set((await readdir(path.join(projectRoot, 'threads')))
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -'.md'.length)));

const eventById = new Map();
for (const id of eventIds) {
  const data = JSON.parse(await readFile(path.join(projectRoot, 'events', `${id}.json`), 'utf8'));
  eventById.set(id, data);
}
const validCopyActions = new Set(['keep', 'rewrite', 'listen']);
const validReaderNoteActions = new Set(['none', 'add']);
const candidateSet = new Set(candidateIds);

for (const id of candidateIds) {
  const decision = decisions[id];
  const isEvent = eventIds.has(id);
  const isThread = threadIds.has(id);
  if (!isEvent && !isThread) {
    errors.push(`${id}: candidate does not exist in events or threads`);
    continue;
  }
  if (!decision || typeof decision !== 'object') {
    errors.push(`${id}: missing decision`);
    continue;
  }
  if (!validCopyActions.has(decision.copyAction)) {
    errors.push(`${id}: copyAction must be keep, rewrite, or listen`);
  }
  if (isEvent) {
    if (!validReaderNoteActions.has(decision.readerNoteAction)) {
      errors.push(`${id}: Event requires readerNoteAction none or add`);
    }
    if (decision.readerNoteAction === 'add' && !decision.readerNote?.trim()) {
      errors.push(`${id}: readerNoteAction add requires readerNote`);
    }
    if (decision.readerNoteAction !== 'add' && decision.readerNote) {
      errors.push(`${id}: readerNote is present but readerNoteAction is not add`);
    }
    if (decision.readerNoteAction === 'add' && eventById.get(id)?.publicationStatus !== 'qualified') {
      errors.push(`${id}: readerNote is only allowed on qualified Events`);
    }
    if (decision.copyAction === 'rewrite' && !decision.newTitle?.trim() && !decision.newSummary?.trim()) {
      errors.push(`${id}: rewrite requires newTitle or newSummary`);
    }
  }
  if (isThread) {
    if (decision.readerNoteAction !== undefined) {
      errors.push(`${id}: Thread must not define readerNoteAction`);
    }
    if (decision.copyAction === 'rewrite' && !decision.newDeck?.trim() && !decision.newBody?.trim()) {
      errors.push(`${id}: rewrite requires newDeck or newBody`);
    }
  }
}

for (const id of Object.keys(decisions)) {
  if (!candidateSet.has(id)) errors.push(`${id}: decision is not present in generated candidates`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Reader Copy validation passed (${candidateIds.length} candidates, ${Object.keys(decisions).length} decisions).`);
}
