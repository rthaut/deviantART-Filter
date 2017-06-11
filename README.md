![deviantART Filter Promotional Image](https://raw.githubusercontent.com/rthaut/deviantART-Filter/development/resources/screenshots/Promo.png)

## Overview
Have you ever been bothered by seeing deviations (submissions) from certain users while browsing [deviantART](https://www.deviantart.com)? Now you can quickly and permanently hide all deviations from any user! Install deviantART Filter in your web browser of choice, then either a.) enter their username on the settings panel, or b.) simply click the new red X that appears in the top right corner of any thumbnail image to filter that user.

* * *

## Installation
### Mozilla Firefox
1. Install from the official Mozilla Add-ons for Firefox: [https://addons.mozilla.org/en-US/firefox/addon/deviantart-filter/](https://addons.mozilla.org/en-US/firefox/addon/deviantart-filter/)
1. There is no step 2

### Google Chrome
1. Install from the official Chrome Web Store: [https://chrome.google.com/webstore/detail/deviantart-filter/odlmamilbohnpnoomjclomghphbajikp](https://chrome.google.com/webstore/detail/deviantart-filter/odlmamilbohnpnoomjclomghphbajikp)
1. There is no step 2

* * *

### Legacy Userscript (Deprecated)
**NOTE:** The userscript version of deviantART Filter is being deprecated in favor of the web extension versions. It is *strongly* recommended that you transition from the userscript version to a web exension (see the [transition instructions](#transitioning-from-legacy-userscript) below).
#### For Mozilla Firefox
1. Install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey) Add-on
1. Restart your browser after installation
1. Visit the [script installation URL](https://github.com/rthaut/deviantART-Filter/raw/development/dist/userscript/deviantART_Filter.user.js) and follow the prompts from Greasemonkey to complete the installation
    - See [this wiki article](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts) for help with installing userscripts in Greasemonkey
#### For Google Chrome
1. Install [Tampermonkey Beta](https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf) Extension
1. Restart your browser after installation
1. Visit the [script installation URL](https://github.com/rthaut/deviantART-Filter/raw/development/dist/userscript/deviantART_Filter.user.js) and follow the prompts from Tampermonkey to complete the installation
    - See [this FAQ entry](http://tampermonkey.net/faq.php#Q102) for help with installing userscripts in Tampermonkey

* * *

### Transitioning from Legacy Userscript
1. Open [deviantART](https://www.deviantart.com/), then click the "Manage Filter" link in the top right corner of the page (next to your username)
1. Click the Settings tab, then click the Export Filters button
1. Copy the **entire** block of text that appears below the button and paste it into a text editor for later use
    - You can click anywhere in the textbox, then press `CTRL`+`A` (or `CMD`+`A`) on your keyboard to select all of the text
    - You may want to save the file in your text editor, just in case, but this is not necessary
1. Disable (or uninstall) the deviantART Filter userscript from Greasemonkey/Tampermonkey
1. Install the deviantART filter web extension for Chrome/Firefox (see the [installation links](#installation) above)
1. Visit [deviantART](https://www.deviantart.com/) again and open the Settings tab again
1. Paste the block of text from step 4 into the textbox below the Export Filters button
1. Click the Import Filters button
1. A dialog will appear confirming the import results
