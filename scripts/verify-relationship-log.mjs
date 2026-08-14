import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/editorial/relationship-candidates.md');
const source = fs.readFileSync(file, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`relationship log verification failed: ${message}`);
};

for (const contract of ['pair', 'why relevant', 'supporting Project/Event', 'candidate relation label', 'reader-facing context needed']) {
  assert(source.includes(contract), `missing ${contract} field`);
}
assert((source.match(/^### RC-\d+/gm) || []).length >= 4, 'expected at least four candidate records');
assert(source.includes('needs-human-review'), 'candidate status must remain human review');
for (const forbidden of ['D3', 'Cytoscape', 'edge score', '关系强度']) {
  assert(source.includes(forbidden), `exit boundary must mention ${forbidden}`);
}
assert(!source.includes('relationship graph implemented'), 'relationship log must not claim a graph implementation');
console.log(`relationship candidate log verified: ${(source.match(/^### RC-\d+/gm) || []).length} candidates, no graph contract`);
