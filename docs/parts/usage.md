## Usage

### Opening the Management Panel/Screen

1. While on [DeviantArt](https://www.deviantart.com), click the red logo that appears on the right side of the address bar. ![DeviantArt Filter Page Action Demo](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Page-Action-Demo.png)
2. The configuration screen will open automatically when you click the icon.

### Creating and Removing Filters

#### You can filter deviations by artist, category, and/or tag through the management panel/screen

1. After [opening the Management Panel/Screen](#opening-the-management-panelscreen), navigate to any of the Manage [Users](#manage-users-page)/[Tags](#manage-tags-page)/[Categories](#manage-categories-page) tabs.
2. To create a new filter, use the form at the top of the tab.
    - For users, enter their username.
    - For tags, enter a single tag (*no spaces*), then choose if the tag should use wildcard matching.
    - For categories, select the parent category, then (optionally) select sub-categories.
3. Use the table that is displayed below the form to view all of your existing filters.
    - You can sort the table by clicking the heading of any column.
    - You can page through your filters using the pagination controls in the lower-left corner.
    - You can choose how many filters are displayed per page using the controls in the lower-right corner.
4. To remove a filter, click the `Remove Filter` button next to the filter you want to remove.

### Exporting/Importing Filters

DeviantArt Filter allows you to export and import filters from a JSON file. This is mostly for keeping your filters in sync between browsers/computers, but is handy for backup purposes as well.

1. After [opening the Management Panel/Screen](#opening-the-management-panelscreen), navigate to the [Import/Export Filters](#importexport-filters-page) tab.
2. To export your current filters to a JSON file, click the `Export Filter Data` button, then open/save the file when prompted (it will use your browser's native download functionality).
3. To import filters from a JSON file, either drag and drop the file onto the designated box, or click the box to open a File Browser dialog and select your JSON file.
    - After the import has finished, a table showing the results of the import will be displayed. This includes how many filters were imported successfully, as well as how many filters failed to import (either because they were invalid or were duplicate).

### Quick Hiding Users While Browsing

1. While browsing on [DeviantArt](https://www.deviantart.com), when you see a deviation from a user you wish to filter, hover over the thumbnail image.
2. An `x` icon will appear in the top-left corner of the thumbnail.
3. Click on the `x` to filter that user.
