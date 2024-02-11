import { PAGES } from "./url";

export const OPTIONS_STORAGE_KEY = "options";

export const DEFAULT_OPTIONS = {
  pages: Object.keys(PAGES)
    .map((page) => [page, true])
    .reduce((acc, [page, enabled]) => ((acc[page] = enabled), acc), {}),
  placeholders: {
    // disabled: false, // TODO: see comments in content.js regarding completely "disabling" placeholders
    preventClick: true,
    showFilterText: true,
  },
  showUpdatedPageOnUpdate: "patch",
  filterUntaggedSubmissionTypes: [],
  metadata: {
    enabled: true,
    missingMetadataIndicators: true,
    loadedMetadataIndicators: false,
  },
};

// TODO: move to another file?
export const SUBMISSION_TYPES = {
  deviations: browser.i18n.getMessage("SubmissionType_PluralLabel_Deviations"),
  journals: browser.i18n.getMessage("SubmissionType_PluralLabel_Journals"),
  updates: browser.i18n.getMessage("SubmissionType_PluralLabel_Updates"),
};
