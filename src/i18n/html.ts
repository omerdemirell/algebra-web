import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
export const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();
export function isTranslatable(value: string) {
  const text = normalizeText(value);
  if (['algebra', 'algebra teknoloji'].includes(text.toLocaleLowerCase('tr'))) return false;
  return (
    /\p{L}/u.test(text) &&
    !/^(?:Algebra(?: Teknoloji)?|ALGEBRA · TECHNOLOGY FOR TOMORROW|algebrateknoloji\.com|info@algebrateknoloji\.com)$/iu.test(
      text,
    ) &&
    !text.startsWith('Oğuzlar, 1364.') &&
    !/^(?:https?:|mailto:|tel:|\/|#)/.test(text)
  );
}
const translatedAttributes = new Set([
  'alt',
  'title',
  'aria-label',
  'aria-roledescription',
  'placeholder',
  'data-open-label',
  'data-close-label',
  'data-search',
  'data-invalid-message',
  'data-valid-message',
  'data-count-label',
]);
const schemaTextKeys = new Set(['name', 'description', 'headline', 'text', 'articleBody']);

/** Translate the rendered content at build time. Scripts, CSS, SVG geometry,
 * identifiers, source assets, language names and postal details stay intact. */
export function transformHTML(
  html: string,
  text: (source: string) => string,
  path?: (source: string) => string,
) {
  const document = parse(html);
  const translated = (value: string) => {
    if (!isTranslatable(value)) return value;
    const source = normalizeText(value);
    const result = text(source);
    return value.replace(/\S[\s\S]*\S|\S/, () => result);
  };
  function json(value: unknown, key = ''): unknown {
    if (typeof value === 'string') {
      if (schemaTextKeys.has(key)) return translated(value);
      if (
        path &&
        ['url', 'item', 'mainEntityOfPage'].includes(key) &&
        value.startsWith('https://algebrateknoloji.com/')
      ) {
        const url = new URL(value);
        url.pathname = path(url.pathname);
        return url.href;
      }
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => json(item));
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, json(v, k)]));
    return value;
  }
  function visit(node: Node, ignored = false) {
    if (node.nodeName === '#text') {
      const n = node as DefaultTreeAdapterMap['textNode'];
      if (!ignored) n.value = translated(n.value);
      return;
    }
    if ('tagName' in node) {
      const element = node as Element;
      const attr = (name: string) => element.attrs.find((a) => a.name === name)?.value;
      const skip = ignored || attr('data-i18n-ignore') !== undefined;
      if (element.tagName === 'script') {
        if (attr('type') === 'application/ld+json') {
          const child = element.childNodes[0] as DefaultTreeAdapterMap['textNode'];
          if (child?.value)
            child.value = JSON.stringify(json(JSON.parse(child.value))).replaceAll('<', '\\u003c');
        }
        return;
      }
      if (element.tagName === 'style') return;
      for (const a of element.attrs) {
        if (!skip && translatedAttributes.has(a.name)) a.value = translated(a.value);
        if (
          a.name === 'content' &&
          element.tagName === 'meta' &&
          /^(?:description|og:title|og:description|twitter:title|twitter:description)$/.test(
            attr('name') || attr('property') || '',
          )
        )
          a.value = translated(a.value);
        if (path && element.tagName === 'a' && a.name === 'href' && !attr('data-language-link'))
          a.value = path(a.value);
      }
      element.childNodes.forEach((child) => visit(child, skip));
    } else if ('childNodes' in node) node.childNodes.forEach((child) => visit(child, ignored));
  }
  visit(document);
  return serialize(document);
}
