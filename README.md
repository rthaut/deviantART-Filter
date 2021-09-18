# DeviantArt Filter

[![Chrome Web Store][chrome-image-version]][chrome-url] [![Microsoft Edge Add-on][edge-image-version]][edge-url] [![Mozilla Add-on][firefox-image-version]][firefox-url]

> This browser extension allows you to filter/block/hide deviations by user and/or keyword on DeviantArt

* * *

## Overview

Have you ever want to block/filter deviations (a.k.a. submissions) while browsing [DeviantArt](https://www.deviantart.com)? **Well now you can!** Simply [install DeviantArt Filter](#installation) in your web browser of choice and start filtering by user and/or keyword.

![DeviantArt Filter Promotional Image](/promo/Screenshot_1280x800.png?raw=true)

### Features

* Fully-featured management panel for maintaining your filters and controlling functionality.
* Quickly create filters from any deviation thumbnail or link.
* Filter deviations by keywords in titles and/or tags (with wildcard support).
* Import and export filter lists for easy backup and migration.

#### For more information, head to the [DeviantArt Filter website](https://rthaut.github.io/deviantART-Filter/).

* * *

## Installation

| Web Browser | Information & Downloads |
| ----------- | ----------------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-users]][chrome-url] |
| Microsoft Edge | [![Microsoft Edge Add-on][edge-image-version]][edge-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-users]][firefox-url] |

* * *

## Contributing

Contributions are always welcome! Even if you aren't comfortable coding, you can always submit [new ideas](https://github.com/rthaut/deviantART-Filter/issues/new?labels=enhancement) and [bug reports](https://github.com/rthaut/deviantART-Filter/issues/new?labels=bug).

### Localization/Translation

This extension is setup to be fully localized/translated into multiple languages, but for now English is the only language with full translations. If you are able to help localize/translate, please [check out this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization). All of the text for the extension is stored [here in the `/app/_locales` directory](https://github.com/rthaut/deviantART-Filter/tree/master/app/_locales).

### Building the Extension

**This extension uses the [WebExtension Toolbox](https://github.com/webextension-toolbox/webextension-toolbox#usage) for development and build processes.**

To build the extension from source code, you will need to use [Node Package Manager (npm)](https://www.npmjs.com/), which handles all of the dependencies needed for this project and is used to execute the various scripts for development/building/packaging/etc.

```sh
npm install
```

Then you can run the development process (where the extension is auto-reloaded when changes are made) for your browser of choice:

```sh
npm run dev <chrome/edge/firefox>
```

Or you can generate a production build for your browser of choice:

```sh
npm run build <chrome/edge/firefox>
```

### Development Process

To make development easier, you can start up a temporary development profile on [Mozilla Firefox](https://getfirefox.com) or [Google Chrome](google.com/chrome) with the extension already loaded. The browser will also automatically detect changes and reload the extension for you (read more about this on the [`web-ext` documentation pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)). Use the following commands **in parallel** to re-build the extension and re-load it in Firefox/Chrome automatically as you make changes:

Firefox:

```sh
npm run dev firefox
npm run start:firefox
```

Chrome:

```sh
npm run dev chrome
npm run start:chrome
```

**Note that you will need 2 terminal instances**, one for each of the above commands, as they both remain running until you cancel them (use <kbd>CTRL</kbd> + <kbd>c</kbd> to cancel each process in your terminal(s)).


[chrome-url]: https://chrome.google.com/webstore/detail/deviantart-filter/odlmamilbohnpnoomjclomghphbajikp
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/odlmamilbohnpnoomjclomghphbajikp?logo=googlechrome&style=for-the-badge
[chrome-image-users]: https://img.shields.io/chrome-web-store/d/odlmamilbohnpnoomjclomghphbajikp?logo=googlechrome&style=for-the-badge

[edge-url]: https://microsoftedge.microsoft.com/addons/detail/deviantart-filter/ockmdbdjebeliigddaglegnnkmcnkkbm
[edge-image-version]: https://img.shields.io/badge/microsoft%20edge%20add--on-v6.2.0-blue?logo=microsoftedge&style=for-the-badge

[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/deviantart-filter/
[firefox-image-version]: https://img.shields.io/amo/v/deviantart-filter?color=blue&logo=firefox&style=for-the-badge
[firefox-image-users]: https://img.shields.io/amo/users/deviantart-filter?color=blue&logo=firefox&style=for-the-badge