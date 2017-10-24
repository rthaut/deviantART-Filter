## Overview
**Have you ever want to block/filter deviations (a.k.a. submissions) while browsing [DeviantArt](https://www.deviantart.com)? Well now you can!**

Simply install DeviantArt Filter in your web browser of choice and filter deviations by user, tag, and/or category from the configuration screen.

![DeviantArt Filter Promotional Image](https://raw.githubusercontent.com/rthaut/DeviantArt-Filter/master/resources/screenshots/Promo.png)

* * *

## Installation
| Web Browser | Information | Download Link |
| ----------- | ----------- | ------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url]<br/>[![Chrome Web Store][chrome-image-download]][chrome-url] | [Download from the Chrome Web Store][chrome-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url]<br/>[![Mozilla Add-on][firefox-image-download]][firefox-url] | [Download from Mozilla Add-ons][firefox-url] |

* * *

## Usage

### Creating and Removing Filters
1. While on [DeviantArt](https://www.deviantart.com), click the red logo that appears on the right side of the address bar.
2. By default, a menu will appear from the icon; click the `Manage Filter` item to open the configuration screen.
    - If you have disabled the `Popup Menu` option, the configuration screen will open automatically when you click the icon.
3. Navigate to any of the Manage Users/Tags/Categories tabs.
4. To create a new filter, use the form at the top of the tab.
    - For users, enter their username.
    - For tags, enter a single tag (*no spaces*), then choose if the tag should use wildcard matching.
    - For categories, select the parent category, then (optionally) select sub-categories.
5. Use the table that is displayed below the form to view all of your existing filters.
    - You can sort the table by clicking the heading of any column.
    - You can page through your filters using the pagination controls in the lower-left corner.
    - You can choose how many filters are displayed per page using the controls in the lower-right corner.
6. To remove a filter, click the `Remove Filter` button next to the filter you want to remove.

### Quick Hiding Users While Browsing
1. While on [DeviantArt](https://www.deviantart.com), when you see a deviation from a user you wish to filter, hover over the thumbnail image.
2. An `x` icon will appear in the top-left corner of the thumbnail.
3. Click on the `x` to filter that user.

### Exporting/Importing Filters
DeviantArt Filter allows you to export and import filters from a JSON file. This is mostly for keeping your filters in sync between browsers/computers, but is handy for backup purposes as well.
1. While on [DeviantArt](https://www.deviantart.com), click the red logo that appears on the right side of the address bar.
2. By default, a menu will appear from the icon; click the `Manage Filter` item to open the configuration screen.
    - If you have disabled the `Popup Menu` option, the configuration screen will open automatically when you click the icon.
3. Navigate to the `Import/Export Filters` tab.
4. To export your current filters to a JSON file, click the `Export Filter Data` button, then open/save the file when prompted (it will use your browser's native download functionality).
5. To import filters from a JSON file, either drag and drop the file onto the designated box, or click the box to open a File Browser dialog and select your JSON file.
    - After the import has finished, a table showing the results of the import will be displayed. This includes how many filters were imported successfully, as well as how many filters failed to import (either because they were invalid or were duplicate).

* * *

## Options
### Management Panel Type
This option determines how the management panel (configuration screen) is displayed.

### Enable Popup Menu
This option determines if a menu is displayed when the icon in the address bar is clicked or if the the management panel (configuration screen) is displayed immediately. The menu includes the ability to quickly toggle the use of placeholders.

### Use Placeholders
This option determines if filtered deviations are hidden completely or if a placeholder image is displayed in their place.


[chrome-url]: https://chrome.google.com/webstore/detail/deviantart-filter/odlmamilbohnpnoomjclomghphbajikp
[chrome-image-download]: https://img.shields.io/chrome-web-store/d/odlmamilbohnpnoomjclomghphbajikp.svg
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/odlmamilbohnpnoomjclomghphbajikp.svg
[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/deviantart-filter/
[firefox-image-download]: https://img.shields.io/amo/d/deviantart-filter.svg
[firefox-image-version]: https://img.shields.io/amo/v/deviantart-filter.svg
