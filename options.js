import { readOptions, validateOption, TOKEN, DEFAULT_OPTIONS } from './search.js';
import { exportOptions, importOptions } from './transfer.js';
import { limitPopupLabel } from './popup-label.js';
import { DEFAULT_POPUP, POPUP_ORIGINS, readPopup } from './popup-settings.js';

const list = document.querySelector('#options');
const status = document.querySelector('#status');
const statusTop = document.querySelector('#status-top');
new MutationObserver(() => { statusTop.textContent = status.textContent; }).observe(status, { childList: true, subtree: true, characterData: true });
const saveButtons = [document.querySelector('#save'), document.querySelector('#save-top')];
function disableSave(disabled) { saveButtons.forEach(button => { button.disabled = disabled; }); }
document.querySelector('#reset-top').addEventListener('click', () => document.querySelector('#reset').click());
document.querySelector('#discard-top').addEventListener('click', () => document.querySelector('#discard').click());
let saved = [];
let dirty = false;
let savedPopup = { ...DEFAULT_POPUP };
let popupEnabled = false;
const popupButton = document.querySelector('#popup-enabled');
const popupTheme = document.querySelector('#popup-theme');
const popupPosition = document.querySelector('#popup-position');
const popupColumns = document.querySelector('#popup-columns');
const popupStatus = document.querySelector('#popup-status');
function renderPopup(settings) {
  popupEnabled = settings.enabled;
  popupButton.setAttribute('aria-checked', String(popupEnabled));
  popupButton.textContent = `Quick popup: ${popupEnabled ? 'On' : 'Off'}`;
  popupTheme.value = settings.theme;
  popupPosition.value = settings.position;
  popupColumns.value = settings.iconsPerRow ?? 8;
}
function collectPopup() { return { enabled: popupEnabled, theme: popupTheme.value, position: popupPosition.value, iconsPerRow: Number(popupColumns.value) }; }
popupButton.addEventListener('click', async () => {
  popupButton.disabled = true;
  try {
    if (!popupEnabled) {
      const granted = await chrome.permissions.request({ origins: POPUP_ORIGINS });
      if (!granted) { popupStatus.textContent = 'Website access was not granted. The right-click menu still works.'; return; }
    }
    renderPopup({ ...collectPopup(), enabled: !popupEnabled });
    popupStatus.textContent = 'Save changes to apply this choice.';
    markDirty();
  } catch { popupStatus.textContent = 'Could not change website access. Try again.'; }
  finally { popupButton.disabled = false; }
});
popupTheme.addEventListener('change', markDirty);
popupPosition.addEventListener('change', markDirty);
popupColumns.addEventListener('input', markDirty);
chrome.permissions.onRemoved.addListener(async () => {
  if (!await chrome.permissions.contains({ origins: POPUP_ORIGINS })) {
    renderPopup({ ...collectPopup(), enabled: false });
    savedPopup.enabled = false;
    popupStatus.textContent = 'Website access was removed. Enable the quick popup to grant it again.';
  }
});

function markDirty() { dirty = true; status.textContent = 'Unsaved changes'; }
function updateCount() {
  const rows = [...list.children];
  document.querySelector('#count').textContent = `${rows.length} sites`;
  document.querySelector('#empty').hidden = rows.length > 0;
  rows.forEach((row, index) => {
    row.querySelector('.up').disabled = index === 0;
    row.querySelector('.down').disabled = index === rows.length - 1;
  });
}

function updateIcon(row) {
  const image = row.querySelector('.site-icon img');
  const fallback = row.querySelector('.site-icon span');
  try {
    const site = new URL(row.querySelector('.url').value.replace(/#searchit#/gi, 'example'));
    if (!['http:', 'https:'].includes(site.protocol)) throw new Error();
    const favicon = new URL(chrome.runtime.getURL('/_favicon/'));
    favicon.searchParams.set('pageUrl', site.origin);
    favicon.searchParams.set('size', '32');
    image.src = favicon.href;
    image.hidden = false;
    fallback.hidden = true;
  } catch { image.removeAttribute('src'); image.hidden = true; fallback.hidden = false; }
}

function addRow(option) {
  const row = document.querySelector('#option-template').content.firstElementChild.cloneNode(true);
  row.dataset.id = option.id;
  row.querySelector('.name').value = option.name;
  row.querySelector('.url').value = option.url;
  const urlInput = row.querySelector('.url');
  urlInput.id = `url-${option.id}`;
  row.querySelector('.url-label').htmlFor = urlInput.id;
  const nameInput = row.querySelector('.name');
  row.querySelector('.link-error').id = `${urlInput.id}-error`;
  urlInput.setAttribute('aria-describedby', `${urlInput.id}-error`);
  row.querySelector('.name-error').id = `name-${option.id}-error`;
  nameInput.setAttribute('aria-describedby', `name-${option.id}-error`);
  const replaceButton = row.querySelector('.replace-selection');
  // Keep the input selection visible when the button is pressed with a mouse or touch.
  replaceButton.addEventListener('pointerdown', event => event.preventDefault());
  replaceButton.addEventListener('click', () => {
    const start = urlInput.selectionStart;
    const end = urlInput.selectionEnd;
    urlInput.focus();
    urlInput.setRangeText(TOKEN, start, end, start === end ? 'end' : 'select');
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    updateIcon(row);
  });
  row.querySelector('.enabled').checked = option.enabled !== false;
  row.querySelector('.incognito').checked = option.incognito === true;
  row.querySelector('.quick-popup').checked = option.quickPopup !== false;
  const popupLabel = row.querySelector('.popup-label');
  popupLabel.value = limitPopupLabel(option.popupLabel);
  const limitLabel = () => { popupLabel.value = limitPopupLabel(popupLabel.value); };
  popupLabel.addEventListener('input', event => { if (!event.isComposing) limitLabel(); });
  popupLabel.addEventListener('compositionend', limitLabel);
  row.querySelector('.site-icon img').addEventListener('error', () => {
    row.querySelector('.site-icon img').hidden = true;
    row.querySelector('.site-icon span').hidden = false;
  });
  row.addEventListener('input', event => {
    markDirty();
    if (event.target === urlInput || event.target === nameInput) {
      row.querySelector(event.target === urlInput ? '.link-error' : '.name-error').hidden = true;
      event.target.removeAttribute('aria-invalid');
    }
  });
  row.querySelector('.url').addEventListener('change', () => updateIcon(row));
  row.querySelector('.remove').addEventListener('click', () => { row.remove(); markDirty(); updateCount(); });
  row.querySelector('.up').addEventListener('click', () => {
    if (row.previousElementSibling) list.insertBefore(row, row.previousElementSibling);
    markDirty(); updateCount(); row.querySelector('.name').focus();
  });
  row.querySelector('.down').addEventListener('click', () => {
    if (row.nextElementSibling) list.insertBefore(row.nextElementSibling, row);
    markDirty(); updateCount(); row.querySelector('.name').focus();
  });
  list.append(row);
  updateIcon(row);
  updateCount();
  return row;
}

function render(options) { list.replaceChildren(); options.forEach(addRow); updateCount(); }
document.querySelector('#add').addEventListener('click', () => {
  const row = addRow({ id: crypto.randomUUID(), name: '', url: '', enabled: true });
  markDirty(); row.querySelector('.name').focus();
});
document.querySelector('#discard').addEventListener('click', () => { render(saved); renderPopup(savedPopup); popupStatus.textContent = ''; dirty = false; status.textContent = 'Changes discarded'; });
document.querySelector('#reset').addEventListener('click', () => {
  render(DEFAULT_OPTIONS.map(option => ({ ...option })));
  renderPopup(DEFAULT_POPUP);
  popupStatus.textContent = '';
  markDirty();
  status.textContent = 'Defaults restored in the editor. Save to apply, or discard to undo.';
});
function collectOptions() {
  const options = [];
  let firstInvalid;
  for (const row of list.children) {
    const option = { id: row.dataset.id, name: row.querySelector('.name').value.trim(), url: row.querySelector('.url').value.trim(), enabled: row.querySelector('.enabled').checked, incognito: row.querySelector('.incognito').checked, quickPopup: row.querySelector('.quick-popup').checked, popupLabel: limitPopupLabel(row.querySelector('.popup-label').value) };
    const nameError = !option.name ? 'Enter a site name.' : option.name.length > 80 ? 'Keep the site name under 81 characters.' : '';
    const linkError = validateOption({ ...option, name: 'Site' });
    for (const [field, error] of [['name', nameError], ['link', linkError]]) {
      const message = row.querySelector(`.${field}-error`);
      const input = row.querySelector(field === 'name' ? '.name' : '.url');
      message.textContent = error;
      message.hidden = !error;
      input.setAttribute('aria-invalid', String(Boolean(error)));
      if (error && !firstInvalid) firstInvalid = input;
    }
    options.push(option);
  }
  if (firstInvalid) {
    firstInvalid.focus();
    throw new Error('Check the highlighted search options.');
  }
  return options;
}

document.querySelector('#settings').addEventListener('submit', async event => {
  event.preventDefault();
  if (!popupColumns.checkValidity() || !Number.isSafeInteger(Number(popupColumns.value))) {
    status.textContent = 'Icons per row must be a whole number of at least 0.';
    popupColumns.focus();
    popupColumns.reportValidity();
    return;
  }
  let options;
  try { options = collectOptions(); }
  catch (error) { status.textContent = error.message; return; }
  disableSave(true);
  try {
    const quickPopup = collectPopup();
    if (quickPopup.enabled && !await chrome.permissions.contains({ origins: POPUP_ORIGINS })) throw new Error('Website access is required. Enable the quick popup again.');
    await chrome.storage.local.set({ searchOptions: options, quickPopup });
    savedPopup = structuredClone(quickPopup);
    saved = structuredClone(options); dirty = false;
    popupStatus.textContent = '';
    status.textContent = 'Saved. Your searches are ready.';
  } catch { status.textContent = 'Could not save. Your changes are still here; try again.'; }
  finally { disableSave(false); }
});

const transferText = document.querySelector('#transfer-text');
const transferStatus = document.querySelector('#transfer-status');
document.querySelector('#export').addEventListener('click', async () => {
  try { transferText.value = exportOptions(collectOptions()); }
  catch (error) { transferStatus.textContent = error.message; return; }
  try {
    await navigator.clipboard.writeText(transferText.value);
    transferStatus.textContent = 'Export generated and copied to the clipboard.';
  } catch {
    transferText.focus(); transferText.select();
    transferStatus.textContent = 'Export generated. Clipboard access failed; copy the selected string manually.';
  }
});
document.querySelector('#import').addEventListener('click', async () => {
  let options;
  try { options = importOptions(transferText.value); }
  catch (error) { transferStatus.textContent = error.message; return; }
  const importButton = document.querySelector('#import');
  importButton.disabled = true;
  disableSave(true);
  try {
    await chrome.storage.local.set({ searchOptions: options });
    saved = structuredClone(options); render(saved);
    dirty = JSON.stringify(collectPopup()) !== JSON.stringify(savedPopup);
    status.textContent = dirty ? 'Imported options saved. Popup settings still have unsaved changes.' : 'Imported options saved. Your searches are ready.';
    transferStatus.textContent = `Imported ${options.length} search options.`;
  } catch { transferStatus.textContent = 'Could not save the import. Your existing options are still here; try again.'; }
  finally { importButton.disabled = false; disableSave(false); }
});
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
try { [saved, savedPopup] = await Promise.all([readOptions(), readPopup()]); render(saved); renderPopup(savedPopup); }
catch { status.textContent = 'Could not load settings. Reload this page to try again.'; disableSave(true); }
