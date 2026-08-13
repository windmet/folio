export interface InlineMentionEntry {
  id: string;
  label: string;
  aliases?: string[];
  events?: Array<{ id?: string } | string>;
}

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const referenceId = (reference: { id?: string } | string) => typeof reference === 'string'
  ? reference
  : reference?.id || '';

const localId = (id: string) => id.split('/').at(-1) || id;

/**
 * Render only the first, non-overlapping surface match for each Mention that
 * is explicitly related to the current Event. The input is plain reader copy,
 * so escaping it here also keeps matching inside HTML impossible.
 */
export const renderMentionInlineLinks = (
  text: string,
  eventId: string,
  mentions: InlineMentionEntry[] = [],
) => {
  if (!text || mentions.length === 0) return escapeHtml(text);

  const candidates = mentions
    .filter((mention) => (mention.events || []).some((reference) => {
      const id = referenceId(reference);
      return id === eventId || localId(id) === eventId;
    }))
    .flatMap((mention, mentionIndex) => {
      const surfaces = [...new Set([
        mention.label,
        ...(mention.aliases || []),
      ].map((surface) => surface.trim()).filter(Boolean))];
      return surfaces.map((surface, surfaceIndex) => ({
        mention,
        mentionIndex,
        surface,
        surfaceIndex,
      }));
    })
    .sort((left, right) => right.surface.length - left.surface.length
      || left.surfaceIndex - right.surfaceIndex
      || left.mentionIndex - right.mentionIndex);

  if (candidates.length === 0) return escapeHtml(text);

  const linkedMentionIds = new Set<string>();
  const chunks: string[] = [];
  let cursor = 0;

  for (let index = 0; index < text.length;) {
    const match = candidates.find((candidate) => !linkedMentionIds.has(candidate.mention.id)
      && text.startsWith(candidate.surface, index));
    if (!match) {
      index += 1;
      continue;
    }

    chunks.push(escapeHtml(text.slice(cursor, index)));
    const href = `?view=mentions&event=${encodeURIComponent(localId(eventId))}#mention-${encodeURIComponent(match.mention.id)}`;
    chunks.push(`<a class="inline-mention" data-mention-link data-mention-id="${escapeHtml(match.mention.id)}" href="${escapeHtml(href)}" aria-label="查看 Mentions：${escapeHtml(match.mention.label)}">${escapeHtml(match.surface)}</a>`);
    linkedMentionIds.add(match.mention.id);
    index += match.surface.length;
    cursor = index;
  }

  chunks.push(escapeHtml(text.slice(cursor)));
  return chunks.join('');
};
