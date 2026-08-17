const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'a', 'img', 'hr', 'sub', 'sup', 'mark',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  span: new Set(['class', 'style']),
  div: new Set(['class', 'style']),
  p: new Set(['class', 'style']),
  table: new Set(['class']),
  td: new Set(['class', 'style']),
  th: new Set(['class', 'style']),
  code: new Set(['class']),
  pre: new Set(['class']),
};

const DANGEROUS_ATTR_PATTERNS = [
  /^on/i,
  /^javascript:/i,
  /^data:text\/html/i,
];

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:')) return false;
  if (trimmed.startsWith('data:text/html')) return false;
  if (trimmed.startsWith('vbscript:')) return false;
  return true;
}

function sanitizeAttributes(element: Element): void {
  const tag = element.tagName.toLowerCase();
  const allowed = ALLOWED_ATTRS[tag] || new Set<string>();
  const attrs = Array.from(element.attributes);
  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    if (DANGEROUS_ATTR_PATTERNS.some((p) => p.test(name))) {
      element.removeAttribute(attr.name);
      continue;
    }
    if (!allowed.has(name)) {
      element.removeAttribute(attr.name);
      continue;
    }
    if ((name === 'href' || name === 'src') && !isSafeUrl(value)) {
      element.removeAttribute(attr.name);
    }
    if (name === 'style') {
      if (/expression\s*\(|javascript:|@import/i.test(value)) {
        element.removeAttribute(attr.name);
      }
    }
  }
  if (tag === 'a') {
    element.setAttribute('rel', 'noopener noreferrer');
    if (!element.getAttribute('target')) {
      element.setAttribute('target', '_blank');
    }
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: () => NodeFilter.FILTER_ACCEPT,
  });
  const toRemove: Element[] = [];
  let node: Node | null = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        toRemove.push(el);
      } else {
        sanitizeAttributes(el);
      }
    }
    node = walker.nextNode();
  }
  for (const el of toRemove) {
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    }
  }
  return doc.body ? doc.body.innerHTML : '';
}
