# SEARCHIT - Right Click Search

A single Chrome extension for searching selected text on an editable list of websites.

## Install

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** at the top right.
3. Choose **Load unpacked** and select the extracted extension folder (`<path-to-extension-folder>`).
4. Click the extension's toolbar icon (under the puzzle-piece button) to open settings.

## Use

Select text on a webpage, right-click, and choose **Search selected text → Search on [site]**. The search opens in a new tab.

Settings include add, remove, edit, enable/disable, reorder, discard, and save. Changes take effect after **Save changes**. An empty list is allowed and removes the search menu.

Settings start in dark mode. Use the theme button at the top to switch themes: a crescent moon indicates dark mode, and a sun indicates light mode. Your choice is remembered automatically without saving the search options.

Check **Incognito** beside a site and save to open its searches in incognito. The menu marks these sites with “(Incognito)”. SEARCHIT reuses an accessible incognito window or opens a new one. Enable **Allow in Incognito** in Chrome's extension details to allow reuse and searches within incognito. Unchecked sites open in a regular window. Incognito preferences are included in exports; older exports default to regular searches.

To add a website, search it for a sample word, copy the results URL, and replace the word with `#SEARCHIT#`. For example:

`https://www.imdb.com/find/?q=#SEARCHIT#`

The selected text is URL-encoded automatically, including Japanese characters, spaces, and punctuation. Websites must support a search URL; searches that require a submitted form or login may not work from a URL alone.

The placeholder is case-insensitive: `#searchit#`, `#SearchIt#`, and `#SEARCHIT#` all work. Link validation errors appear directly below the link field.

## Import and export

Expand **Import & export** at the bottom of settings. **Export & copy** creates a portable `SEARCHIT:v1:` string in the text box and copies it to your clipboard. It includes the current options, including unsaved edits, order, and enabled states. Fix any invalid fields before exporting. If clipboard copying is blocked, copy the string from the text box manually.

Paste that string into the same section in another instance and click **Import**. Import replaces all existing options and saves immediately. Invalid strings leave the existing list intact. Export first if you want to keep a backup. Theme preferences stay local to each instance.

## Icons and Chrome limitations

Settings load site icons from Chrome's built-in favicon service. Availability and freshness depend on Chrome's favicon cache; visiting or reloading the website can help. Changing a search link updates its icon request automatically. No third-party favicon service is used.

Chrome's context-menu API does not accept per-entry icons. The submenu uses the extension's own icon. Multiple search tools are grouped in one submenu.

Settings are saved locally in this browser profile. There are no content scripts, analytics, or broad website access permissions. The extension requests context menus, local storage, and favicon access.

## Verification

Run `node --test` (or `npm test` if npm is installed) for search URL and menu lifecycle checks. To check in Chrome, load the extension, save an edited search link, select `日本語 & coffee`, and launch a search. Also check disabling, reordering, and deleting all options.
