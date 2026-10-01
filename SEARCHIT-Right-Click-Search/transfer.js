import { validateOption } from './search.js';

const PREFIX = 'SEARCHIT:v1:';

function checkOptions(options) {
  if (!Array.isArray(options)) throw new Error('The import must contain a list of search options.');
  return options.map((option, index) => {
    const error = validateOption(option);
    if (error) throw new Error(`Search option ${index + 1}: ${error}`);
    if (typeof option.enabled !== 'boolean') throw new Error(`Search option ${index + 1}: Invalid enabled state.`);
    if (option.incognito !== undefined && typeof option.incognito !== 'boolean') throw new Error(`Search option ${index + 1}: Invalid incognito state.`);
    return { name: option.name.trim(), url: option.url.trim(), enabled: option.enabled, incognito: option.incognito === true };
  });
}

export function exportOptions(options) {
  return PREFIX + JSON.stringify({ options: checkOptions(options) });
}

export function importOptions(text) {
  const value = text.trim();
  if (!value.startsWith(PREFIX)) throw new Error('Paste a complete SEARCHIT export string (version 1).');
  let data;
  try { data = JSON.parse(value.slice(PREFIX.length)); }
  catch { throw new Error('The export string is incomplete or invalid. Copy it again and retry.'); }
  return checkOptions(data?.options).map(option => ({ ...option, id: crypto.randomUUID() }));
}
