import { SUBMISSION_URL_REGEX } from "../constants/url";

import { RemoveFilterAttributesOnNode as RemoveKeywordFilterAttributesOnNode } from "./keywords";

export const STORAGE_KEY = "users";
export const ID_PROP_NAME = "username";
export const UNIQUE_KEYS = ["username"];

//TODO: a VERY small portion DOM nodes don't have a username available until AFTER metadata is loaded (the known case is for Stash items); it doesn't make sense to wait for metadata to load for all DOM nodes, but having a way to re-apply this filter after metadata loads (for DOM nodes that have NOT already been processed) would be useful
export const REQUIRES_METADATA = false;

export const ALLOWED_FILTER_ATTRIBUTE_NAME = "da-filter-allowed-user";

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid if the filter is valid
 * @property {string} [message] validation error message
 */

/**
 * Validates a user filter and returns an object indicating if it is valid or not (and why)
 * @param {Object} filter the user filter
 * @param {string} filter.username the username of the the filter
 * @returns {ValidationResult} validation result
 */
export const validate = ({ username }) => {
  if (!username || String(username).trim().length === 0) {
    return {
      isValid: false,
      message: browser.i18n.getMessage("RequiredFieldEmptyError", [
        browser.i18n.getMessage("Filter_Users_PropTitle_Username"),
      ]),
    };
  } else if (!/^[a-zA-Z0-9\-]+$/.test(username)) {
    return {
      isValid: false,
      message: browser.i18n.getMessage(
        "Filter_Users_PropInvalidPatternError_Username",
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
    if ((filter.username ?? "").length > 0) {
      if (filter.type?.toLowerCase() === "allowed") {
        allowed.push(filter.username.toLowerCase());
      } else {
        blocked.push(filter.username.toLowerCase());
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
  const username = GetUsernameForNode(node);

  if (!username) {
    console.warn("Failed to Identify Username for Deviation", node);
    return;
  }

  if (allowed.includes(username.toLowerCase())) {
    SetFilterAttributesOnNode(node, username, true);
  }

  if (blocked.includes(username.toLowerCase())) {
    SetFilterAttributesOnNode(node, username, false);
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

  for (const username of allowed) {
    nodes = [
      ...nodes,
      ...document.querySelectorAll(
        `[${ALLOWED_FILTER_ATTRIBUTE_NAME}="${username}" i]`,
      ),
    ];
  }

  for (const username of blocked) {
    nodes = [
      ...nodes,
      ...document.querySelectorAll(`[da-filter-user="${username}" i]`),
    ];
  }

  for (const node of nodes) {
    RemoveFilterAttributesOnNode(node, true);
  }
};

/**
 * Removes filter attributes from all DOM nodes on the page
 * Used primarily for when user filters are disabled
 */
export const DisableFilter = () => {
  const nodes = document.querySelectorAll(
    `[da-filter-user], [${ALLOWED_FILTER_ATTRIBUTE_NAME}]`,
  );
  for (const node of nodes) {
    RemoveFilterAttributesOnNode(node, true);
  }
};

/**
 * Gets the username for a DOM node
 * @param {HTMLElement} node the DOM node
 * @returns {string} the username
 */
const GetUsernameForNode = (node) => {
  // first look for the data-username attribute on the DOM node,
  // then look for the first child element with the data-username attribute
  let username =
    node.getAttribute("data-username") ||
    node.querySelector("[data-username]")?.getAttribute("data-username");

  if (!username) {
    const url = node.getAttribute("href");
    if (SUBMISSION_URL_REGEX.test(url)) {
      ({ username } = SUBMISSION_URL_REGEX.exec(url).groups);

      // set the username attribute now to avoid parsing the URL again
      node.setAttribute("data-username", username);
    } else {
      console.warn("URL does not match regex", url, SUBMISSION_URL_REGEX);
    }
  }

  return username;
};

/**
 * Sets attributes on a DOM node for filtering (by username)
 * @param {HTMLElement} node the DOM node
 * @param {string} username the username that matched a filter
 * @param {boolean} [isAllowed=false] if the filter is for an "allowed" username
 */
const SetFilterAttributesOnNode = (node, username, isAllowed = false) => {
  if (isAllowed) {
    node.setAttribute(ALLOWED_FILTER_ATTRIBUTE_NAME, username);
    RemoveFilterAttributesOnNode(node);
    RemoveKeywordFilterAttributesOnNode(node);
  } else {
    node.setAttribute("da-filter-user", username);
  }
};

/**
 * Removes attributes on a DOM node for filtering (by username)
 * @param {HTMLElement} node the DOM node
 * @param {boolean} removeAll if the attributes for "allowed" filters should be removed
 */
export const RemoveFilterAttributesOnNode = (node, removeAll = false) => {
  node.removeAttribute("da-filter-user");

  if (removeAll) {
    node.removeAttribute(ALLOWED_FILTER_ATTRIBUTE_NAME);
  }
};
