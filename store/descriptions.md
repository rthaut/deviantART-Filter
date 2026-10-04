# Store descriptions

Draft listing text for the 7.0.0 submissions. Paste the text under each heading into the matching store field. It is plain prose on purpose: the Chrome Web Store rejects descriptions that read as lists of keywords or features ("keyword spam").

## Chrome Web Store and Microsoft Edge Add-ons

### Summary

The summary comes from the extension's `ExtensionDescription` message in `public/_locales/en/messages.json`:

> Allows configurable filtering/removal of deviations by user and/or keyword on DeviantArt.

### Description

DeviantArt Filter hides deviations you don't want to see while you browse DeviantArt.

You can filter by user, so their work is hidden wherever it appears on the site. You can also filter by keyword, which matches deviation titles and tags, and a keyword can use wildcard matching to catch variations of a word. Filtered deviations are replaced with a placeholder that shows why they were hidden, so the page layout stays intact.

To create filters while you browse, right-click a deviation and choose "Create Filters from this Deviation," or right-click a tag to filter it directly. The management page, opened from the toolbar button on any DeviantArt page, lists all of your filters so you can search, edit, and remove them. You can also export your filters to a file and import them in another browser.

The extension runs only on deviantart.com. It stores your filters and settings in your browser and does not collect or send any personal data. To look up a deviation's title and tags, it calls DeviantArt's public oEmbed service.

DeviantArt Filter is open source: https://github.com/rthaut/deviantART-Filter

It is not affiliated with or endorsed by DeviantArt.

## Firefox Add-ons (AMO)

### Summary

> Hide deviations on DeviantArt by user or keyword. Filters apply as you browse, and filtered deviations are replaced with a placeholder.

### Description

Use the same text as the Chrome Web Store description above. AMO accepts plain text; no HTML is needed.

## Notes for the listings

- The current AMO summary and description still mention tag and category filters, which were replaced by keyword filters in 6.0.0 and removed in 6.2.0. Replace both.
- The current AMO description links to "install DeviantArt Filter from Mozilla Add-ons" and to `rthaut.github.io/DeviantArt-Filter/`. The new text drops both.
- Release notes are on GitHub Releases and in `CHANGELOG.md`, so the listings don't need a changelog.
