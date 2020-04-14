# DeviantArt Filter Changelog

## Version 6.0.0 Alpha 1 (April 14, 2020)

*(**Tote**: This entry may be updated and/or replaced with future version 6.0.0 alpha/beta/final/etc release information.)*

### New Features

- **Eclipse Support**. DeviantArt Filter now supports [the new site (a.k.a Eclipse)](https://www.deviantarteclipse.com/). It also supports the "classic" site fore users who are not yet using Eclipse.
- **New Management Page**. The management page has been completely rewritten using more modern frameworks.
- **Filter by Title**. Tag filters have been replaced with keyword filters, which apply to both tags and titles for all deviations.
- **Quick Filter Tag Context Menu**. A new context (right-click) menu is available on all tag links; use this to quickly create a keyword filter for the linked tag.
- **Faster Metadata Lookup**. DeviantArt Filter v6+ uses faster APIs to load metadata (tags and categories) while you browse, so filters should apply faster than they did in v5.x.

### Known issues

- **Filters are not validated**. When creating/updating filters, no restrictions or validations are implemented to help prevent invalid filters from being created.
- **Options are missing**. There are currently no configurable options for DeviantArt Filter v6.0.0.
  - **Placeholders**: Placeholders cannot be disabled for the new Eclipse site, as the Eclipse layout calculates grid positions for each thumbnail, and removing an item from the grid breaks the layout. The ability to turn off placeholders may be re-implemented for the classic site in the future, but there are currently no plans to bring it back.
  - **Placeholder Colors**: The colors for placeholders cannot currently be adjusted, but are instead hard-coded for each site theme (dark/light/green for Eclipse, and classic).
  - **Metadata Caching**: DeviantArt Filter v6.0.0 does not currently cache metadata like v5.x did; it metadata caching is re-implemented, the corresponding options will be brought back to allow users to disable/configure the caching behavior.

## Version 5.1 (February 6, 2019)

### New Features

- **Custom Placeholder Styles**. You can now control the colors used for the placeholders on filtered deviations. Management Panel/Screen, go to the Options tab, and set the Background, Logo, and/or Text Colors for Placeholders. Note that these settings are ineffective if you have placeholders disabled.
- **Metadata Batch Size**. A new (somewhat experimental) feature has been implemented to allow control over how much metadata is loaded at once (for category and tag filters). Setting this to a lower value may help your browsing performance.

### Bug Fixes

- Clarify and restrict the use of the hashtag symbol (`#`) when creating tag filters ([#57](https://github.com/rthaut/deviantART-Filter/issues/57))

## Version 5.0.3 (June 22, 2018)

### Bug Fixes

- [Tag and Category Filters do not Work](https://github.com/rthaut/deviantART-Filter/issues/48)
- [Cannot Quick Filter Users from Journal Thumbnails](https://github.com/rthaut/deviantART-Filter/issues/52)

### Release Notes

Upgrading to Version 5.0.3 will reset your cached metadata. **This shouldn't have any noticeable impact, but if do encounter any issues (like metadata not loading, or tag and category filters not working), you may need to restart your browser.**

Also, please be aware that the changes/fixes made in Version 5.0.3 (just like 5.0.1 and 5.0.2) are **primarily for people who are in the Beta Test program for DeviantArt**, which is only available for Core members with paid subscriptions. If you are in the Beta Test program and encounter issues with DeviantArt Filter, please either [send me (rthaut) a private Note on DeviantArt](https://www.deviantart.com/notifications/notes/#to=rthaut) or [create a new issue on GitHub](https://github.com/rthaut/deviantART-Filter/issues) so I can (try to) make DeviantArt Filter compatible with the beta changes.

## Version 5.0.2 (June 16, 2018)

### Bug Fixes

- [User Quick Filter No Longer Works](https://github.com/rthaut/deviantART-Filter/issues/51)

## Version 5.0.1 (June 13, 2018)

### Bug Fixes

- [User Quick Filter Causes All Thumbnails to be Filtered](https://github.com/rthaut/deviantART-Filter/issues/46)
- Fixes the rendering of the category sub-levels when creating category filters

## Version 5.0 (May 13, 2018)

**Version 5 is a complete re-write.** There is a significant amount of new functionality, which, in combination with modern best/common practices, has resulted in a very different user experience for managing your filters. Please see the [section on Opening the Management Panel/Screen](https://github.com/rthaut/deviantART-Filter#opening-the-management-panelscreen) for help.

### New Features

- Filter Tags and Categories
  - In addition to filtering deviations from specific users, you can now filter uses with specific tags and/or submitted to specific categories.
  - Note that there is a slight delay while browsing before your tag and category filters are applied. If your tag and/or category filters do not seem to be working, you may want to [enable the debug indicators for metadata](https://github.com/rthaut/deviantART-Filter#show-metadata-debug-indicators) to see if metadata is actually being loaded while you browse.
- Sort and Page through Filters
  - You can now sort your filters and page through them (instead of scrolling through one giant list).
- Improved Import and Export
  - Filters are exported to a file (instead of requiring you to manually copy/paste the data).
  - The import/export interface has been overhauled to provide detailed information about import results.
  - Drag and drop support for importing filters from a file
- Placeholders Show Why a Thumbnail is Filtered
  - Since you are now able to filter by tag, category, or user, the placeholder image (when placeholders are enabled) shows which filter is applied.
- Support for Translations/Internationalization
  - Currently, DeviantArt Filter is only available in English, but version 5 fully supports translations. **If you want to help translate DeviantArt Filter into other languages, please see [CONTRIBUTING](https://github.com/rthaut/deviantART-Filter/blob/master/CONTRIBUTING.md).**

### Bug Fixes

- [Filters do not Work on Subdomains](https://github.com/rthaut/deviantART-Filter/issues/26)
- [Apply Filtering to Thumbnails in Comments](https://github.com/rthaut/deviantART-Filter/issues/25)
