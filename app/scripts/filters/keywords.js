import { RemoveFilterAttributesOnNode as RemoveUserFilterAttributesOnNode } from "./users";

export const STORAGE_KEY = "keywords";
export const ID_PROP_NAME = "keyword";
export const UNIQUE_KEYS = ["keyword"];

export const REQUIRES_METADATA = true;

export const ALLOWED_FILTER_ATTRIBUTE_NAME = "da-filter-allowed-keywords";

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid if the filter is valid
 * @property {string} [message] validation error message
 */

/**
 * Validates a keyword filter and returns an object indicating if it is valid or not (and why)
 * @param {Object} filter the keyword filter
 * @param {string} filter.keyword the keyword of the the filter
 * @returns {ValidationResult} validation result
 */
export const validate = ({ keyword }) => {
  if (!keyword || String(keyword).trim().length === 0) {
    return {
      isValid: false,
      message: browser.i18n.getMessage("RequiredFieldEmptyError", [
        browser.i18n.getMessage("Filter_Keywords_PropTitle_Keyword"),
      ]),
    };
  } else if (!/^[a-zA-Z0-9\_]+$/.test(keyword)) {
    return {
      isValid: false,
      message: browser.i18n.getMessage(
        "Filter_Keywords_PropInvalidPatternError_Keyword",
      ),
    };
  }
  return { isValid: true };
};

/**
 * Splits a list of filters into a list of allowed and blocked filters
 * @param {Object[]} filters the full list of filters
 * @returns {Object} the split list of allowed and blocked filters
 */
export const SplitFilters = (filters) => {
  const allowed = [];
  const blocked = [];

  filters.forEach((filter) => {
    if ((filter.keyword ?? "").length > 0) {
      if (filter.type?.toLowerCase() === "allowed") {
        allowed.push(filter);
      } else {
        blocked.push(filter);
      }
    }
  });

  return { allowed, blocked };
};

/**
 * Applies filters to a DOM node
 * @param {HTMLElement} node the DOM node
 * @param {Object} filters the map of allowed and blocked filters to apply
 * @param {Object[]} filters.allowed the list of allowed filters to apply
 * @param {Object[]} filters.blocked the list of blocked filters to apply
 */
export const ApplyFiltersToNode = (
  node,
  { allowed, blocked } = { allowed: [], blocked: [] },
) => {
  for (const { keyword, wildcard } of allowed) {
    const operator = wildcard ? "*" : "~";
    if (node.matches(`[data-tags${operator}="${keyword}" i]`)) {
      SetFilterAttributesOnNode(node, keyword, "Tags", true);
      continue;
    } else if (node.matches(`[data-title${operator}="${keyword}" i]`)) {
      SetFilterAttributesOnNode(node, keyword, "Title", true);
      continue;
    }
  }

  for (const { keyword, wildcard } of blocked) {
    const operator = wildcard ? "*" : "~";
    if (node.matches(`[data-tags${operator}="${keyword}" i]`)) {
      SetFilterAttributesOnNode(node, keyword, "Tags", false);
      continue;
    } else if (node.matches(`[data-title${operator}="${keyword}" i]`)) {
      SetFilterAttributesOnNode(node, keyword, "Title", false);
      continue;
    }
  }
};

/**
 * Applies filters to the page
 * Used primarily for handling added filters when local storage changes
 * @param {Object[]} filters list of filters to apply
 * @param {string} selector CSS selector for DOM nodes
 */
export const ApplyFiltersToDocument = (filters, selector) => {
  const { allowed, blocked } = SplitFilters(filters);

  const nodes = document.querySelectorAll(selector);
  nodes.forEach((node) => ApplyFiltersToNode(node, { allowed, blocked }));
};

/**
 * Removes filters from the page and applies remaining active filters to each unfiltered DOM node
 * Used primarily for handling removed filters when local storage changes
 * @param {Object[]} removedFilters list of filters to remove
 */
export const RemoveFiltersFromDocument = (removedFilters) => {
  const { allowed, blocked } = SplitFilters(removedFilters);

  let nodes = [];

  for (const { keyword } of allowed) {
    nodes = [
      ...nodes,
      ...document.querySelectorAll(
        `[${ALLOWED_FILTER_ATTRIBUTE_NAME}="${keyword}" i]`,
      ),
    ];
  }

  for (const { keyword } of blocked) {
    nodes = [
      ...nodes,
      ...document.querySelectorAll(`[da-filter-keyword="${keyword}" i]`),
    ];
  }

  for (const node of nodes) {
    RemoveFilterAttributesOnNode(node, true);
  }
};

/**
 * Removes filter attributes from all DOM nodes on the page
 * Used primarily for when keyword filters are disabled
 */
export const DisableFilter = () => {
  const nodes = document.querySelectorAll(
    `[da-filter-keyword], [${ALLOWED_FILTER_ATTRIBUTE_NAME}]`,
  );
  for (const node of nodes) {
    RemoveFilterAttributesOnNode(node, true);
  }
};

/**
 * Sets attributes on a DOM node for filtering (by keyword)
 * @param {HTMLElement} node the DOM node
 * @param {string} keyword the keyword that matched a filter
 * @param {string} [attribute] the attribute that matched a filter
 * @param {boolean} [isAllowed=false] if the filter is for an "allowed" keyword
 */
const SetFilterAttributesOnNode = (
  node,
  keyword,
  attribute = null,
  isAllowed = false,
) => {
  if (isAllowed) {
    const allowedKeywords =
      node.getAttribute(ALLOWED_FILTER_ATTRIBUTE_NAME)?.split(" ") ?? [];
    node.setAttribute(
      ALLOWED_FILTER_ATTRIBUTE_NAME,
      Array.from(new Set([...allowedKeywords, keyword]))
        .join(" ")
        .trim(),
    );
    RemoveFilterAttributesOnNode(node);
    RemoveUserFilterAttributesOnNode(node);
  } else {
    node.setAttribute("da-filter-keyword", keyword);

    if (attribute) {
      node.setAttribute("da-filter-keyword-attribute", attribute);
    }
  }
};

/**
 * Removes attributes on a DOM node for filtering (by keyword)
 * @param {HTMLElement} node the  DOM node
 * @param {boolean} removeAll if the attributes for "allowed" filters should be removed
 */
export const RemoveFilterAttributesOnNode = (node, removeAll = false) => {
  node.removeAttribute("da-filter-keyword");
  node.removeAttribute("da-filter-keyword-attribute");

  if (removeAll) {
    node.removeAttribute(ALLOWED_FILTER_ATTRIBUTE_NAME);
  }
};
