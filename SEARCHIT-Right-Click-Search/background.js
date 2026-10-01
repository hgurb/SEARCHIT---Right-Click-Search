import { readOptions, validateOption, buildSearchUrl } from './search.js';

function createMenu(properties) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.create(properties, () => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

let menuQueue = Promise.resolve();
export function rebuildMenus() {
  menuQueue = menuQueue.catch(() => {}).then(async () => {
    const options = await readOptions();
    await chrome.contextMenus.removeAll();
    const enabled = options.filter(option => option.enabled !== false && !validateOption(option));
    if (!enabled.length) return;
    await createMenu({ id: 'search-root', title: 'Search selected text', contexts: ['selection'] });
    for (const option of enabled) {
      await createMenu({ id: `search:${option.id}`, parentId: 'search-root', title: `Search on ${option.name.replaceAll('%', '％')}${option.incognito === true ? ' (Incognito)' : ''}`, contexts: ['selection'] });
    }
  });
  return menuQueue;
}

const refresh = () => rebuildMenus().catch(error => console.error('Could not update search menu:', error));

export async function openSearch(option, text, sourceTab) {
  const url = buildSearchUrl(option, text);
  const incognito = option.incognito === true;
  // A regular source window is already known to be usable for regular searches.
  if (!incognito && sourceTab?.incognito === false) {
    await chrome.tabs.create({ url, windowId: sourceTab.windowId });
    return;
  }
  let target;
  try {
    const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    target = windows.find(window => window.incognito === incognito && window.id === sourceTab?.windowId)
      ?? windows.find(window => window.incognito === incognito);
  } catch { /* If enumeration is unavailable, create a window explicitly. */ }
  if (target) {
    try { await chrome.tabs.create({ url, windowId: target.id }); }
    catch {
      // The target may have closed between enumeration and opening the tab.
      await chrome.windows.create({ url, incognito, focused: true });
      return;
    }
    // A focus failure must not cause a duplicate search tab.
    await chrome.windows.update(target.id, { focused: true }).catch(() => {});
    return;
  }
  await chrome.windows.create({ url, incognito, focused: true });
}

chrome.runtime.onInstalled.addListener(refresh);
chrome.runtime.onStartup.addListener(refresh);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.searchOptions) refresh();
});
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!String(info.menuItemId).startsWith('search:') || !info.selectionText) return;
  try {
    const options = await readOptions();
    const option = options.find(item => `search:${item.id}` === info.menuItemId && item.enabled !== false);
    if (option) await openSearch(option, info.selectionText, tab);
  } catch (error) { console.error('Could not open search:', error); }
});
