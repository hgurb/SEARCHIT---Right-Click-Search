import { readOptions, validateOption, TOKEN } from './search.js';
import { exportOptions, importOptions } from './transfer.js';

const list = document.querySelector('#options');
const status = document.querySelector('#status');
let saved = [];
let dirty = false;

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
document.querySelector('#discard').addEventListener('click', () => { render(saved); dirty = false; status.textContent = 'Changes discarded'; });
function collectOptions() {
  const options = [];
  let firstInvalid;
  for (const row of list.children) {
    const option = { id: row.dataset.id, name: row.querySelector('.name').value.trim(), url: row.querySelector('.url').value.trim(), enabled: row.querySelector('.enabled').checked, incognito: row.querySelector('.incognito').checked };
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
  let options;
  try { options = collectOptions(); }
  catch (error) { status.textContent = error.message; return; }
  const saveButton = document.querySelector('#save');
  saveButton.disabled = true;
  try {
    await chrome.storage.local.set({ searchOptions: options });
    saved = structuredClone(options); dirty = false;
    status.textContent = 'Saved. Your right-click searches are ready.';
  } catch { status.textContent = 'Could not save. Your changes are still here; try again.'; }
  finally { saveButton.disabled = false; }
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
  const saveButton = document.querySelector('#save');
  importButton.disabled = true;
  saveButton.disabled = true;
  try {
    await chrome.storage.local.set({ searchOptions: options });
    saved = structuredClone(options); render(saved); dirty = false;
    status.textContent = 'Imported options saved. Your right-click searches are ready.';
    transferStatus.textContent = `Imported ${options.length} search options.`;
  } catch { transferStatus.textContent = 'Could not save the import. Your existing options are still here; try again.'; }
  finally { importButton.disabled = false; saveButton.disabled = false; }
});
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
try { saved = await readOptions(); render(saved); }
catch { status.textContent = 'Could not load settings. Reload this page to try again.'; document.querySelector('#save').disabled = true; }
