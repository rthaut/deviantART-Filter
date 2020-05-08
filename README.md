# DeviantArt Filter 6.0.0

> This browser extension allows you to filter/block/hide deviations by user, keyword, and/or category on DeviantArt

## Overview

Have you ever want to block/filter deviations (a.k.a. submissions) while browsing [DeviantArt](https://www.deviantart.com)? **Well now you can!** Simply [install DeviantArt Filter](#installation) in your web browser of choice and start filtering by user, keyword, and/or category.

![DeviantArt Filter Promotional Image](/screenshots/Promo.png?raw=true)

### Features

* Hide all deviations for specific users
* Hide all deviations submitted to specific categories
* Hide all deviations with specific tags
* Hide all deviations with specific keywords in the title

#### For more information, head to the [DeviantArt Filter website](https://rthaut.github.io/deviantART-Filter/).

* * *

## Installation

| Web Browser | Information | Download Link |
| ----------- | ----------- | ------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-download]][chrome-url] | [Download from the Chrome Web Store][chrome-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-download]][firefox-url] | [Download from Mozilla Add-ons][firefox-url] |

[chrome-url]: https://chrome.google.com/webstore/detail/deviantart-filter/odlmamilbohnpnoomjclomghphbajikp
[chrome-image-download]: https://img.shields.io/chrome-web-store/d/odlmamilbohnpnoomjclomghphbajikp.svg
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/odlmamilbohnpnoomjclomghphbajikp.svg

[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/deviantart-filter/
[firefox-image-download]: https://img.shields.io/amo/d/deviantart-filter.svg
[firefox-image-version]: https://img.shields.io/amo/v/deviantart-filter.svg

* * *

## Contributing

Contributions are always welcome! Even if you aren't comfortable coding, you can always submit [new ideas](https://github.com/rthaut/deviantART-Filter/issues/new?labels=enhancement) and [bug reports](https://github.com/rthaut/deviantART-Filter/issues/new?labels=bug).

### Localization/Translation

This extension is setup to be fully localized/translated into multiple languages, but for now English is the only language with full translations. If you are able to help localize/translate, please [check out this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization). All of the text for the extension is stored [here in the `/app/_locales` directory](https://github.com/rthaut/deviantART-Filter/tree/master/app/_locales).

### Building the Extension

To build the extension from source code, you will need to use [Node Package Manager (npm)](https://www.npmjs.com/), which handles all of the dependencies needed for this project and is used to execute the various scripts for development/building/packaging/etc.

```sh
npm install
```

To build a production version of the extension, use the `npm run dev <browser>` command, which will compile the source code from the `/app` directory to the `/dist`directory and create a ZIP archive in the `/packages` directory.

```sh
npm run build firefox # OR npm run build chrome
```

### Development Process

To make development easier, you can start up a temporary development profile on [Mozilla Firefox](https://getfirefox.com) with the extension already loaded. Firefox will also automatically detect changes and reload the extension for you (read more about this on the [`web-ext` documentation pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)). Use the following commands to re-build the extension and re-load it in Firefox automatically as you make changes:

```sh
npm run dev firefox
npm run firefox:start
```

Note you will need 2 terminal instances, one for each of the above commands, as they both remain running until you cancel them (use <kbd>CTRL</kbd> + <kbd>c</kbd> to cancel each process in your terminal(s)).
