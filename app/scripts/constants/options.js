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
};
