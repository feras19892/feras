export type TokenType = 'number' | 'ident' | 'op' | 'paren' | 'semi' | 'comma' | 'eq';

export interface Token {
  type: TokenType;
  value: string;
}

const SINGLE: Record<string, TokenType> = {
  '+': 'op',
  '-': 'op',
  '*': 'op',
  '/': 'op',
  '^': 'op',
  '×': 'op',
  '÷': 'op',
  '=': 'eq',
  ';': 'semi',
  ',': 'comma',
  '(': 'paren',
  ')': 'paren',
};

export function tokenize(input: string): Token[] {
  const normalized = input
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens: Token[] = [];
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    const type = SINGLE[ch];
    if (type) {
      tokens.push({ type, value: ch });
      i++;
      continue;
    }
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(normalized[i + 1] ?? ''))) {
      let num = '';
      while (i < normalized.length && (/\d/.test(normalized[i]) || normalized[i] === '.')) {
        num += normalized[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < normalized.length && /[a-zA-Z]/.test(normalized[i])) {
        ident += normalized[i];
        i++;
      }
      tokens.push({ type: 'ident', value: ident.toLowerCase() });
      continue;
    }
    throw new Error(`Unexpected character: "${ch}"`);
  }
  return tokens;
}
