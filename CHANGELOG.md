# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Chrome and Edge now use Manifest V3 (minimum version 88). Firefox stays on Manifest V2 (minimum version 62). The requested permissions are unchanged.
- Chrome and Edge: the toolbar button is now enabled only on deviantart.com tabs, the same way the old page action button worked
- The extension is now built with [WXT](https://wxt.dev/) instead of webextension-toolbox
- The management page now uses React Router 6
- Firefox: the add-on now declares that it does not collect any data
- The release notes page that opens after an update is now the GitHub release for the new version

### Fixed

- Deviation URLs are now encoded when loading metadata, so URLs that contain `&`, `#`, or `+` no longer load the wrong metadata or none ([#295](https://github.com/rthaut/deviantART-Filter/issues/295))

### Security

- Updated lodash-es to 4.18.1 (fixes [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc), [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh), and [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg))
- Updated react-router-dom to 6.30.6, which includes the open redirect fix for [GHSA-jjmj-jmhj-qwj2](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2)

## [6.2.2] - 2024-01-23

### Changed

- Tweaked appearance of management page

### Fixed

- Fixed Chrome and Edge builds
- Fixed JSON file restriction for filter import
- Fixed Dark Mode toggle not taking effect immediately

## [6.2.1] - 2024-01-18

### Fixed

- Fixed (hopefully) filters not working on/after January 17, 2024

## [6.2.0] - 2021-09-18

### Added

- New context menu on Deviation links to create a User filter directly
- New options for configuring the placeholders:
  - Leave filtered thumbnails clickable
  - Hide the filter reason/type text on placeholders

### Removed

- Removed Category filters, as [DeviantArt has basically deprecated categories](https://github.com/rthaut/deviantART-Filter/issues/153)

## [6.1.1] - 2020-05-23

### Added

- **Configure if/when update information is displayed.** You can now fine tune which updates (major, minor, patch, none) show the release notes page when the extension is updated.
- **User filters are now applied to status updates.** Your Users filters are now automatically applied to status updates. Note that Keyword filters are **not** applied to status updates.

### Fixed

- [New Create Filters Modal Shows on All Open Pages](https://github.com/rthaut/deviantART-Filter/issues/140)
- Metadata status indicators/outlines are no longer applied to status updates (since status updates do not have metadata)
- The "history" extension permission is no longer required
- [Management page no longer loads in Waterfox browser](https://github.com/rthaut/deviantART-Filter/issues/141)

## [6.1.0] - 2020-05-18

A video of the new filter creation process, accessed via a right-click menu on any deviation thumbnail/link: [create-filter-modal-process.mp4](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/videos/create-filter-modal-process.mp4)

### Added

- **Filters can now be disabled on certain pages.** A new "Options" section has been added to the dashboard where you can disable filter functionality for the following pages:
  - Daily Deviations Page
  - Forum Pages
  - Notifications Page
- **Quickly create user, category, and keyword tags from any deviation.** This is accessed by right-clicking on any deviation link/thumbnail and clicking the new "Create Filters from this Deviation" menu option.
  - **NOTE:** The old quick hide icon (`x`) in the upper-left corner of thumbnails has been removed in favor of the new context (right-click) menu.

### Fixed

- [Quick Hide Icon Interferes with Native Remove Icon on Notifications Page](https://github.com/rthaut/deviantART-Filter/issues/132)
- Placeholders are no longer broken on forum posts with filtered deviations

## [6.0.0] - 2020-05-07

### Added

- **Eclipse Support**. DeviantArt Filter now supports [the new site (a.k.a Eclipse)](https://www.deviantarteclipse.com/). It also supports the "classic" site for users who are not yet using Eclipse.
- **New Management Page**. The management page has been completely rewritten using more modern frameworks.
- **Filter by Title**. Tag filters have been replaced with keyword filters, which apply to both tags and titles for all deviations.
- **Quick Filter Tag Context Menu**. A new context (right-click) menu is available on all tag links; use this to quickly create a keyword filter for the linked tag.
- **Faster Metadata Lookup**. DeviantArt Filter v6+ uses faster APIs to load metadata (tags and categories) while you browse, so filters should apply sooner than they did in v5.x.

### Removed

- **Options are missing**. There are currently no configurable options for DeviantArt Filter v6.0.0.
  - **Placeholders**: Placeholders cannot be disabled for the new Eclipse site, as the Eclipse layout calculates grid positions for each thumbnail, and removing an item from the grid breaks the layout. The ability to turn off placeholders may be re-implemented for the classic site in the future, but there are currently no plans to bring it back.
  - **Placeholder Colors**: The colors for placeholders cannot currently be adjusted, but are instead hard-coded for each site theme (dark/light/green for Eclipse, and classic).
  - **Metadata Caching**: DeviantArt Filter v6.0.0 does not currently cache metadata like v5.x did; if metadata caching is re-implemented, the corresponding options will be brought back to allow users to disable/configure the caching behavior.

## [5.1.2] - 2019-06-28

### Fixed

- Tag and Category Filters Broken Due to Missing Metadata ([#103](https://github.com/rthaut/deviantART-Filter/issues/103))
- Management Panel Doesn't Work in Firefox 55-57 ([#97](https://github.com/rthaut/deviantART-Filter/issues/97))

## [5.1.1] - 2019-02-07

### Fixed

- Placeholder Toggle No Longer Takes Immediate Effect ([#66](https://github.com/rthaut/deviantART-Filter/issues/66))
- Chrome: Placeholders are Missing the Logo and Text ([#67](https://github.com/rthaut/deviantART-Filter/issues/67))

## [5.1.0] - 2019-02-06

### Added

- **Custom Placeholder Styles**. You can now control the colors used for the placeholders on filtered deviations. Management Panel/Screen, go to the Options tab, and set the Background, Logo, and/or Text Colors for Placeholders. Note that these settings are ineffective if you have placeholders disabled.
- **Metadata Batch Size**. A new (somewhat experimental) feature has been implemented to allow control over how much metadata is loaded at once (for category and tag filters). Setting this to a lower value may help your browsing performance.

### Fixed

- Clarify and restrict the use of the hashtag symbol (`#`) when creating tag filters ([#57](https://github.com/rthaut/deviantART-Filter/issues/57))

## [5.0.3] - 2018-06-22

Upgrading to Version 5.0.3 will reset your cached metadata. **This shouldn't have any noticeable impact, but if do encounter any issues (like metadata not loading, or tag and category filters not working), you may need to restart your browser.**

Also, please be aware that the changes/fixes made in Version 5.0.3 (just like 5.0.1 and 5.0.2) are **primarily for people who are in the Beta Test program for DeviantArt**, which is only available for Core members with paid subscriptions. If you are in the Beta Test program and encounter issues with DeviantArt Filter, please either [send me (rthaut) a private Note on DeviantArt](https://www.deviantart.com/notifications/notes/#to=rthaut) or [create a new issue on GitHub](https://github.com/rthaut/deviantART-Filter/issues) so I can (try to) make DeviantArt Filter compatible with the beta changes.

### Fixed

- [Tag and Category Filters do not Work](https://github.com/rthaut/deviantART-Filter/issues/48)
- [Cannot Quick Filter Users from Journal Thumbnails](https://github.com/rthaut/deviantART-Filter/issues/52)

## [5.0.2] - 2018-06-16

### Fixed

- [User Quick Filter No Longer Works](https://github.com/rthaut/deviantART-Filter/issues/51)

## [5.0.1] - 2018-06-13

### Fixed

- [User Quick Filter Causes All Thumbnails to be Filtered](https://github.com/rthaut/deviantART-Filter/issues/46)
- Fixes the rendering of the category sub-levels when creating category filters

## [5.0.0] - 2018-05-13

**Version 5 is a complete re-write.** There is a significant amount of new functionality, which, in combination with modern best/common practices, has resulted in a very different user experience for managing your filters. Please see the [section on Opening the Management Panel/Screen](https://github.com/rthaut/deviantART-Filter#opening-the-management-panelscreen) for help.

### Added

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

### Fixed

- [Filters do not Work on Subdomains](https://github.com/rthaut/deviantART-Filter/issues/26)
- [Apply Filtering to Thumbnails in Comments](https://github.com/rthaut/deviantART-Filter/issues/25)

[unreleased]: https://github.com/rthaut/deviantART-Filter/compare/v6.2.2...HEAD
[6.2.2]: https://github.com/rthaut/deviantART-Filter/compare/v6.2.1...v6.2.2
[6.2.1]: https://github.com/rthaut/deviantART-Filter/compare/v6.2.0...v6.2.1
[6.2.0]: https://github.com/rthaut/deviantART-Filter/compare/v6.1.1...v6.2.0
[6.1.1]: https://github.com/rthaut/deviantART-Filter/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/rthaut/deviantART-Filter/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/rthaut/deviantART-Filter/compare/v5.1.2...v6.0.0
[5.1.2]: https://github.com/rthaut/deviantART-Filter/compare/v5.1.1...v5.1.2
[5.1.1]: https://github.com/rthaut/deviantART-Filter/compare/v5.1.0...v5.1.1
[5.1.0]: https://github.com/rthaut/deviantART-Filter/compare/v5.0.3...v5.1.0
[5.0.3]: https://github.com/rthaut/deviantART-Filter/compare/v5.0.2...v5.0.3
[5.0.2]: https://github.com/rthaut/deviantART-Filter/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/rthaut/deviantART-Filter/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/rthaut/deviantART-Filter/compare/v4.1.0...v5.0.0
