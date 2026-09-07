export type HelpBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'ordered'; items: string[] }
  | { type: 'formula'; text: string | string[] }
  | { type: 'cards'; items: string[] };

export type HelpSection = {
  title: string;
  blocks: HelpBlock[];
};
