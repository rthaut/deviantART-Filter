import { PAGES } from "./url";

export const DEFAULT_OPTIONS = {
  pages: Object.keys(PAGES)
    .map((page) => [page, true])
    .reduce((acc, [page, enabled]) => ((acc[page] = enabled), acc), {}),
  placeholders: {
    preventClick: true,
    showFilterText: true,
  },
  showUpdatedPageOnUpdate: "patch",
  filterUntaggedSubmissionTypes: [],
};

// TODO: move to another file?
export const SUBMISSION_TYPES = {
  deviations: browser.i18n.getMessage("SubmissionType_PluralLabel_Deviations"),
  journals: browser.i18n.getMessage("SubmissionType_PluralLabel_Journals"),
  updates: browser.i18n.getMessage("SubmissionType_PluralLabel_Updates"),
};
