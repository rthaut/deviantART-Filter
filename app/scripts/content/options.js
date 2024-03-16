import { DEFAULT_OPTIONS, OPTIONS_STORAGE_KEY } from "../constants/options";

/**
 * Gets all options from extension storage
 * @returns {Promise<Object>} the options as a structured object
 */
export const GetOptions = () =>
  browser.storage.local
    .get({
      [OPTIONS_STORAGE_KEY]: DEFAULT_OPTIONS,
    })
    .then((data) => data[OPTIONS_STORAGE_KEY]);

export const ApplyAttributesForOptions = (options) => {
  document.body.setAttribute(
    "da-filter-only-allowed",
    options.onlyShowAllowed.join(" "),
  );

  document.body.setAttribute(
    "da-filter-untagged",
    options.filterUntaggedSubmissionTypes.join(" "),
  );

  const metadataAttributes = [];
  if (options.metadata?.missingMetadataIndicators) {
    metadataAttributes.push("indicate-missing");
  }
  if (options.metadata?.loadedMetadataIndicators) {
    metadataAttributes.push("indicate-loaded");
  }

  document.body.setAttribute(
    "da-filter-metadata",
    metadataAttributes.join(" "),
  );

  const placeholderAttributes = [];
  if (options.placeholders?.disabled) {
    // TODO: expose an option for completely "disabling" placeholders if it is ever feasible
    // for now, though, disabling placeholders is difficult (impossible, even?) for at least 2 reasons:
    // 1) we need to target the parent-most unique DOM node containing the filtered deviation's link
    //    this is non-trivial due to inconsistent DOM structures for thumbnails across the site,
    //    although there may be some `:has()` wizardry to do it via CSS selectors in modern browsers
    // 2) we would then have to re-arrange the layout(s) due to DeviantArt using explicit grids
    //    again this is non-trivial due to inconsistent DOM structures across the site
    placeholderAttributes.push("disabled");
  } else {
    if (options.placeholders?.preventClick) {
      placeholderAttributes.push("prevent-click");
    }
    if (options.placeholders?.showFilterText) {
      placeholderAttributes.push("show-filter-text");
    }
  }

  document.body.setAttribute(
    "da-filter-placeholders",
    placeholderAttributes.join(" "),
  );
};
