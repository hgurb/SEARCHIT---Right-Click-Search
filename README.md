# SEARCHIT - Right Click Search

A single Chrome extension for searching selected text on an editable list of websites. Current version: **1.1.0**.

## Install

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** at the top right.
3. Choose **Load unpacked** and select the extracted extension folder (`<path-to-extension-folder>`).
4. Click the extension's toolbar icon (under the puzzle-piece button) to open settings.

## Use

Select text on a webpage, right-click, and choose **Search selected text → Search on [site]**. The search opens in a new tab.

Settings include add, remove, edit, enable/disable, reorder, discard, and save. Changes take effect after **Save changes**. An empty list is allowed and removes the search menu.

Reset to defaults, Discard changes, and Save changes are available above the Quick popup section as well as below the website list. Both locations show the same save status.

On wide screens, the search link gets three times the width of the site-name field. On narrow screens, fields stack vertically.

Each website card groups its three checkboxes together, with tall reorder arrows beside them, Remove aligned with the input fields, and the popup label beside Quick popup.

**Reset to defaults** restores IMDb, Reddit, YouTube, and default popup settings in the editor. Save to apply the reset, or discard to undo it.

## Quick popup

Turn on **Quick popup** in settings, grant website access when Chrome asks, and save. Select text on an ordinary webpage to see a small bar of clickable site icons. The right-click menu remains available. The popup is off by default and uses dark mode initially. Its light/dark appearance is independent of the settings-page theme.

**Icons per row (0 = unlimited)** defaults to 8. Enter a whole number of at least 0, or use the input’s up/down arrows, then save. Additional icons continue on the next row. Set 0 to keep all icons in one row, with horizontal scrolling if needed. For positive values, narrow windows may use fewer columns to keep the popup on screen. Reset to defaults restores 8; this global preference stays local, like popup appearance and position.

The label field beside each site's Quick popup checkbox accepts up to three characters, including symbols and emoji. Saved labels appear in uppercase as small badges at the bottom right of popup icons. Incognito badges always appear at the top right, keeping them separate from labels. Labels are included in imports and exports; older exports have empty labels.

Choose bottom right, bottom left, bottom center, right, left, top right, top left, or top center. Four additional corner positions place the popup just 2px above or below the selection: right corners start at its right edge and extend right; left corners end at its left edge and extend left. Near screen edges the popup moves inside the viewport. Each site has a **Quick popup** checkbox beneath Enabled and Incognito. Enabled is the master switch for both menus; unchecking Quick popup hides that site only from the icon bar. Both menus respect Incognito. Press Escape or click outside to dismiss the popup.

The popup works on ordinary HTTP/HTTPS pages where access is allowed, not Chrome internal pages or the Chrome Web Store. Selections inside text inputs and editable fields are excluded. The compact bar uses 20px site icons with 28px buttons. Incognito sites have a tiny hat-and-glasses badge at the top right of their icon. Site icons use Chrome’s favicon service, with a letter fallback when unavailable. No third-party icon service is used.

Settings start in dark mode. Use the theme button at the top to switch themes: a crescent moon indicates dark mode, and a sun indicates light mode. Your choice is remembered automatically without saving the search options.

The extension name in the header links to its Chrome Web Store page and includes a colored store icon and an external-link arrow.

Check **Incognito** beside a site and save to open its searches in incognito. The menu marks these sites with “(Incognito)”. SEARCHIT reuses an accessible incognito window or opens a new one. Enable **Allow in Incognito** in Chrome's extension details to allow reuse and searches within incognito. Unchecked sites open in a regular window. Incognito preferences are included in exports; older exports default to regular searches.

To add a website, search it for a sample word, copy the results URL, and replace the word with `#SEARCHIT#`. For example:

`https://www.imdb.com/find/?q=#SEARCHIT#`

The selected text is URL-encoded automatically, including Japanese characters, spaces, and punctuation. Websites must support a search URL; searches that require a submitted form or login may not work from a URL alone.

The placeholder is case-insensitive: `#searchit#`, `#SearchIt#`, and `#SEARCHIT#` all work. Link validation errors appear directly below the link field.

## Import and export

Expand **Import & export** at the bottom of settings. **Export & copy** creates a portable `SEARCHIT:v1:` string in the text box and copies it to your clipboard. It includes the current options, including unsaved edits, order, and enabled states. Fix any invalid fields before exporting. If clipboard copying is blocked, copy the string from the text box manually.

Paste that string into the same section in another instance and click **Import & save**. Import replaces all existing options and saves immediately. Invalid strings leave the existing list intact. Export first if you want to keep a backup. Per-site popup and Incognito checkboxes are included; older exports include every enabled site in the popup. Global popup preferences and settings-page theme stay local to each instance.

## Icons and Chrome limitations

The extension icon uses a glossy orange finish while preserving its mouse cursor and magnifying glass. The editable SVG and PNG generation script are included.

Settings load site icons from Chrome's built-in favicon service. Availability and freshness depend on Chrome's favicon cache; visiting or reloading the website can help. Changing a search link updates its icon request automatically. No third-party favicon service is used.

Chrome's context-menu API does not accept per-entry icons. The submenu uses the extension's own icon. Multiple search tools are grouped in one submenu.

Settings are saved locally in this browser profile. There are no analytics or tracking. The extension requests context menus, local storage, favicon access, and scripting. Optional website access is requested when enabling the quick popup, so its content script can detect selected text and display the bar. Search text is sent to the chosen site only when you click a search action.

## Source code

SEARCHIT is open source under the MIT license. Review the code, contribute, or download it for manual installation at https://github.com/hgurb/SEARCHIT---Right-Click-Search.

## Verification

Run `node --test` (or `npm test` if npm is installed) for search URL and menu lifecycle checks. To check in Chrome, load the extension, save an edited search link, select `日本語 & coffee`, and launch a search. Also check disabling, reordering, and deleting all options.
