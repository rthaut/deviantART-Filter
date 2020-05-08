---
layout: default
title: Usage
permalink: /usage
nav_order: 3
has_toc: false
---

# Usage

These are some basic instructions for using DeviantArt Filter.

## Opening the Management Page

1. While on DeviantArt, click the orange logo that appears on the right side of the address bar. ![DeviantArt Filter Page Action Demo](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Page-Action-Demo-Transparent.png?raw=true)
2. The configuration screen will open automatically when you click the icon.

* * *

## Creating and Removing Filters

### You can filter deviations by artist, category, and/or keyword through the management page

1. After opening the [Management Page]({{ '/screenshots#dashboard' | absolute_url }}), navigate to any of the Manage [Users]({{ '/screenshots#manage-users' | absolute_url }})/[Keywords]({{ '/screenshots#manage-keywords' | absolute_url }})/[Categories]({{ '/screenshots#manage-categories' | absolute_url }}) views.
2. Use the table that is displayed to view all of your existing filters.
    - You can sort the table by clicking the heading of any column.
    - You can page through your filters using the pagination controls below the table.
3. To create a new filter, use the **plus icon (+)** above the table to the right of the search bar.
    - For users, enter their username.
    - For keywords, enter a single keyword (*no spaces*), then choose if the keyword should use wildcard matching by checking the wildcard checkbox.
    - For categories, select the category path from the menu (you can type in the field to filter results).
4. To change an existing filter, like the **pencil icon (✎)** next to the filter you want to change.
    - Click the **check mark icon (✔)** to the left of the filter you are changing to **save** your change(s).
    - Click the **cross icon (❌)** next to the left of the filter you are changing to **discard** your change(s).
5. To remove a filter, click the trash can button next to the filter you want to remove.
    - Click the **check mark icon (✔)** to the left of the filter you are removing to **confirm**.
    - Click the **cross icon (❌)** next to the left of the filter you are changing to **cancel**.

* * *

## Exporting/Importing Filters

DeviantArt Filter allows you to export and import filters from a JSON file. This is mostly for keeping your filters in sync between browsers/computers, but is handy for backup purposes as well.

1. Open the [Management Page]({{ '/screenshots#opening-the-management-page' | absolute_url }}).
2. To export your current filters to a JSON file, click the `Export Filter Data` button, then open/save the file when prompted (it will use your browser's native download functionality).
3. To import filters from one or more JSON file(s), either drag and drop the file(s) onto the designated box, or click the box to open a File Browser dialog and select your JSON file(s).
    - After the import has finished, a [table showing the results]({{ '/screenshots#dashboard---import-results' | absolute_url }}) of the import will be displayed. This includes how many filters were imported successfully, as well as how many filters failed to import and how many were duplicates.

* * *

## Quick Hiding Users While Browsing

1. While browsing on DeviantArt, when you see a deviation from a user you wish to filter, hover over the thumbnail image.
2. An `x` icon will appear in the top-left corner of the thumbnail.
3. Click on the `x` to filter that user.
