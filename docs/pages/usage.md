---
layout: default
title: Usage
permalink: /usage
nav_order: 3
has_toc: false
---

# Usage
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

* * *

## Opening the Management Page

1. While on DeviantArt, click the orange logo that appears on the right side of the address bar. ![DeviantArt Filter Page Action Demo](https://raw.githubusercontent.com/rthaut/DeviantArt-Filter/master/screenshots/Page-Action-Demo-Transparent.png?raw=true)
2. The configuration screen will open automatically when you click the icon.

* * *

## Creating and Removing Filters

### Creating Filters While Browsing

You can quickly create filters for any deviation you see while browsing from a context (right-click) menu.

1. While browsing DeviantArt, right click on any thumbnail image or link to a deviation.
2. Click the "Create Filters from this Deviation" option.
3. Use the [form in the modal dialog]({{ '/screenshots#create-filter-modal' | absolute_url }}) that is displayed to create a user filter, a category filter, and/or keyword filters.

### Creating Filters Through the Management Page

For more advanced control of your filters, you should use the management page.

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

## Disabling on Certain Pages

Filters can be disabled from being applied on certain pages.

1. Open the [Management Page]({{ '/screenshots#opening-the-management-page' | absolute_url }}).
2. Under the "Options" section on the dashboard, use the toggle switch for the desired page(s) to disable/enable filters for the listed page(s).
    - You will need to refresh/reload any open pages to apply the changes.
