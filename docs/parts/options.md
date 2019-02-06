## Options

Options for DeviantArt filtered are configured through the [Management Panel/Screen](#opening-the-management-panelscreen) on the [Options](#options-page) tab.

### Use Placeholders for Filtered Deviations

`When enabled, a placeholder image is displayed instead of the actual thumbnail for filtered deviations. Disable this setting to completely remove filtered deviation thumbnails.`

If you want to see/know when a deviation was filtered (and why), enable this option (it is enabled by default). This will show a placeholder instead of the deviation's thumbnail (similar to Mature Content that is blocked). If you would rather just completely hide deviations matching any of your filters, disable this option, and the thumbnails will be removed entirely.

### Background/Logo/Text Color for Placeholders

`Set a custom color for the background/logo/text of the placeholder shown in place of filtered deviations.`

Use these three options to control the style of the placeholders that are inserted for filtered deviations. These settings are ignored when placeholders are disabled altogether.

### Management Panel Type

`Specifies where/how the main management panel is displayed when clicking the DeviantArt Filter logo by the address bar.`

This option allows you to control if the DeviantArt Filter Management page is opened in a new tab in your current browser window, or if a new popup window is opened. The default behavior for this option is to use a new tab in the current window.

### Metadata Batch Size

`Specifies the number of deviations for which to load metadata at a time. Setting this value to a lower number may improve browsing performance.`

This option limits how much metadata (used for category and tag filters) is loaded at once. The default is 96, which means that metadata for up to 96 deviations is retrieved for deviations on the page and loaded for the tag and category filters to use. Lowering this number may improve browsing performance, so you can try different values for this option to see if you notice any improvements.

### Number of Days to Cache Metadata

`Specifies the number of days to cache metadata (for tags and categories) locally for deviations. Set this value to disable local caching completely.`

By default, DeviantArt Filter caches the metadata for deviations while browsing [DeviantArt](https://www.deviantart.com) on your computer. This is done so that your category and tag filters can be applied more quickly on subsequent visits, as retrieving metadata for each page of deviations takes 2-5 seconds on an average internet connection. You can disable the local cache completely by setting this option to `0`, but this will cause a noticeable delay before tag and category filters are applied. You can also increase this setting, although setting a value that is too large may cause performance issues.

### Show Metadata Debug Indicators

`When enabled, deviation thumbnails with missing metadata (for tags and categories) have a red outline, and deviations with metadata have a green outline. This is primarily for debugging, but can be a neat visual for curious people.`

This setting, as the description states, is primarily for troubleshooting and debugging. It is used simply to show which deviations have loaded metadata (i.e. their tags and which category they are in). Because metadata has to be fetched from DeviantArt's API, your tag and category filters cannot be applied until that metadata is loaded. The outlines (green for loaded, red for NOT loaded), can help you see why your filters may not seem to be working.
