export const STORAGE_KEY = "keywords";

export const REQUIRES_METADATA = true;

/**
 * Applies filters to a DOM node
 * @param {HTMLElement} node the DOM node
 * @param {object[]} filters the list of filters to apply
 */
export const ApplyFiltersToNode = (node, filters) => {
  for (const filter of filters) {
    const operator = filter.wildcard ? "*" : "~";
    if (node.matches(`[data-tags${operator}="${filter.keyword}" i]`)) {
      SetFilterAttributesOnNode(node, filter.keyword, "Tags");
      continue;
    } else if (node.matches(`[data-title${operator}="${filter.keyword}" i]`)) {
      SetFilterAttributesOnNode(node, filter.keyword, "Title");
      continue;
    }
  }
};

/**
 * Applies filters to the page
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} filters list of filters to apply
 * @param {string} selector CSS selector for DOM nodes
 */
export const ApplyFiltersToDocument = (filters, selector) => {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach((node) => ApplyFiltersToNode(node, filters));
};

/**
 * Removes filters from the page and applies remaining active filters to each unfiltered DOM node
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} removedFilters list of filters to remove
 * @param {object[]} activeFilters list of filters that are still active
 */
export const RemoveFiltersFromDocument = (removedFilters, activeFilters) => {
  for (const filter of removedFilters) {
    const nodes = document.querySelectorAll(
      `[da-filter-keyword="${filter.keyword}" i]`,
    );
    for (const node of nodes) {
      RemoveFilterAttributesOnNode(node);
      ApplyFiltersToNode(node, activeFilters);
    }
  }
};

/**
 * Sets attributes on a DOM node for filtering (by keyword)
 * @param {HTMLElement} node the DOM node
 * @param {string} keyword the keyword that matched a filter
 * @param {string} [attribute] the attribute that matched a filter
 */
const SetFilterAttributesOnNode = (node, keyword, attribute = null) => {
  node.setAttribute("da-filter-keyword", keyword);

  if (attribute) {
    node.setAttribute("da-filter-keyword-attribute", attribute);
  }
};

/**
 * Removes attributes on a DOM node for filtering (by keyword)
 * @param {HTMLElement} node the  DOM node
 */
const RemoveFilterAttributesOnNode = (node) => {
  node.removeAttribute("da-filter-keyword");
  node.removeAttribute("da-filter-keyword-attribute");
};
