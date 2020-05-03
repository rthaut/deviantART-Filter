# DeviantArt Filter 6.0.0

> Allows configurable filtering/removal of deviations by user, keyword, and/or category on DeviantArt

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Permissions](#permissions)
- [Usage](#usage)
- [Options](#options)
- [Screenshots](#screenshots)

## Overview

Have you ever want to block/filter deviations (a.k.a. submissions) while browsing [DeviantArt](https://www.deviantart.com)? **Well now you can!** Simply [install DeviantArt Filter](#installation) in your web browser of choice and start filtering by user, keyword, and/or category.

![DeviantArt Filter Promotional Image](/screenshots/Promo.png?raw=true)

* * *

## Installation

***Find the latest alpha/beta builds on the [releases](https://github.com/rthaut/deviantART-Filter/releases) page.***

* * *

## Permissions

These are the required browser permissions for DeviantArt Filter.

If you would like to know more about permissions in general, Mozilla has a [support article about permissions](https://support.mozilla.org/en-US/kb/permission-request-messages-firefox-extensions), as well as a [guide for assessing the safety of an extension](https://support.mozilla.org/en-US/kb/tips-assessing-safety-extension).

Please [submit a new issue](https://github.com/rthaut/deviantART-Filter/issues/new) if you are still concerned about the use of any of the following permissions so the information provided below can be updated to cover common concerns and answer common questions.

### Access your data for sites in the deviantart.com domain

This permission is used to apply filters to DeviantArt pages and to add the quick-hide icon in the upper-left corner of deviation thumbnails.

### Access browsing history

The History permission is used to remove the DeviantArt Filter Management Page from your browser's history.

### Display notifications to you

The Notifications permission is used to display a notification message when upgrading from version 4.x to version 5.x.

### Access browser tabs

The Tabs permission is used to apply filter changes from the Management Page to all open DeviantArt tabs, to enable/disable the DeviantArt Filter icon, and to switch to the Management Page (if it is already open) when clicking the DeviantArt Filter icon.

* * *

## Usage

### Opening the Management Page

1. While on [DeviantArt](https://www.deviantart.com), click the orange logo that appears on the right side of the address bar. ![DeviantArt Filter Page Action Demo](/screenshots/Page-Action-Demo.png?raw=true)
2. The configuration screen will open automatically when you click the icon.

### Creating and Removing Filters

#### You can filter deviations by artist, category, and/or keyword through the management page

1. After opening the [Management Page](#dashboard), navigate to any of the Manage [Users](#manage-users)/[Keywords](#manage-keywords)/[Categories](#manage-categories) views.
2. Use the table that is displayed to view all of your existing filters.
    - You can sort the table by clicking the heading of any column.
    - You can page through your filters using the pagination controls below the table.
3. To create a new filter, use the plus icon (:heavy_plus_sign:) above the table to the right of the search bar.
    - For users, enter their username.
    - For keywords, enter a single keyword (*no spaces*), then choose if the keyword should use wildcard matching by checking the wildcard checkbox.
    - For categories, select the category path from the menu (you can type in the field to filter results).
4. To change an existing filter, like the pencil icon (:pencil2:) next to the filter you want to change.
    - Click the checkmark icon (:heavy_check_mark:) to the left of the filter you are changing to **save** your change(s).
    - Click the multiplication icon (:heavy_multiplication_x:) next to the left of the filter you are changing to **discard** your change(s).
5. To remove a filter, click the trash can button next to the filter you want to remove.
    - Click the checkmark icon (:heavy_check_mark:) to the left of the filter you are removing to **confirm**.
    - Click the multiplication icon (:heavy_multiplication_x:) next to the left of the filter you are changing to **cancel**.

### Exporting/Importing Filters

DeviantArt Filter allows you to export and import filters from a JSON file. This is mostly for keeping your filters in sync between browsers/computers, but is handy for backup purposes as well.

1. Open the [Management Page](#opening-the-management-page).
2. To export your current filters to a JSON file, click the `Export Filter Data` button, then open/save the file when prompted (it will use your browser's native download functionality).
3. To import filters from one or more JSON file(s), either drag and drop the file(s) onto the designated box, or click the box to open a File Browser dialog and select your JSON file(s).
    - After the import has finished, a [table showing the results](#dashboard---import-results) of the import will be displayed. This includes how many filters were imported successfully, as well as how many filters failed to import and how many were duplicates.

### Quick Hiding Users While Browsing

1. While browsing on [DeviantArt](https://www.deviantart.com), when you see a deviation from a user you wish to filter, hover over the thumbnail image.
2. An `x` icon will appear in the top-left corner of the thumbnail.
3. Click on the `x` to filter that user.

* * *

## Options

*Options are currently **not** available in DeviantArt Filter v6.0.0*

* * *

## Screenshots

### Dashboard

Screenshot of the DeviantArt Filter Dashboard
![Screenshot of the DeviantArt Filter dashboard](/screenshots/Dashboard-Light.png?raw=true)

Screenshot of the DeviantArt Filter Dashboard (Using Dark Mode)
![Screenshot of the DeviantArt Filter dashboard (using Dark Mode)](/screenshots/Dashboard-Dark.png?raw=true)

### Dashboard - Import Results

Screenshot of the Filter Import Results
![Screenshot of the filter import results](/screenshots/Dashboard-Import-Results-Light.png?raw=true)

Screenshot of the Filter Import Results (Using Dark Mode)
![Screenshot of the filter import results (using Dark Mode)](/screenshots/Dashboard-Import-Results-Dark.png?raw=true)

### Manage Users

Screenshot of the Filtered Users View
![Screenshot of the filtered users view](/screenshots/Users-Light.png?raw=true)

Screenshot of the Filtered Users View (Using Dark Mode)
![Screenshot of the filtered users view (using Dark Mode)](/screenshots/Users-Dark.png?raw=true)

### Manage Users - Editing a Filter

Screenshot of Editing a User Filter
![Screenshot of editing a user filter](/screenshots/Users-Editing-Light.png?raw=true)

Screenshot of Editing a User Filter (Using Dark Mode)
![Screenshot of editing a user filter (using Dark Mode)](/screenshots/Users-Editing-Dark.png?raw=true)

### Manage Keywords

Screenshot of the Filtered Keywords View
![Screenshot of the filtered keywords view](/screenshots/Keywords-Light.png?raw=true)

Screenshot of the Filtered Keywords View (Using Dark Mode)
![Screenshot of the filtered keywords view (using Dark Mode)](/screenshots/Keywords-Dark.png?raw=true)

### Manage Keywords - Editing a Filter

Screenshot of Editing a Keyword Filter
![Screenshot of editing a keyword filter](/screenshots/Keywords-Editing-Light.png?raw=true)

Screenshot of Editing a Keyword Filter (Using Dark Mode)
![Screenshot of editing a keyword filter (using Dark Mode)](/screenshots/Keywords-Editing-Dark.png?raw=true)

### Manage Categories

Screenshot of the Filtered Categories View
![Screenshot of the filtered categories view](/screenshots/Categories-Light.png?raw=true)

Screenshot of the Filtered Categories View (Using Dark Mode)
![Screenshot of the filtered categories view (using Dark Mode)](/screenshots/Categories-Dark.png?raw=true)

### Manage Categories - Editing a Filter

Screenshot of Editing a Category Filter
![Screenshot of editing a category filter](/screenshots/Categories-Editing-Light.png?raw=true)

Screenshot of Editing a Category Filter (Using Dark Mode)
![Screenshot of editing a category filter (using Dark Mode)](/screenshots/Categories-Editing-Dark.png?raw=true)
