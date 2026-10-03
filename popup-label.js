const characters = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
export function limitPopupLabel(value) {
  if (typeof value !== 'string') return '';
  return Array.from(characters.segment(value), item => item.segment).slice(0, 3).join('');
}
