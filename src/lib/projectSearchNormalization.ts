const honorificSuffix = /(?:さん|くん|君|ちゃん)(?=$|[\s　])/g;

export const normalizeProjectSearchText = (value: unknown) => String(value ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase('ja-JP')
  .replace(honorificSuffix, '')
  .replace(/[\s　]+/g, ' ')
  .trim();
