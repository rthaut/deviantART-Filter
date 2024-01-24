import { SUBMISSION_URL_REGEX } from "../constants/url";

export const STORAGE_KEY = "users";

export const UNIQUE_KEYS = ["username"];

//TODO: a VERY small portion DOM nodes don't have a username available until AFTER metadata is loaded (the known case is for Stash items); it doesn't make sense to wait for metadata to load for all DOM nodes, but having a way to re-apply this filter after metadata loads (for DOM nodes that have NOT already been processed) would be useful
export const REQUIRES_METADATA = false;

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
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      message: "Username cannot be empty", // TODO: i18n
    };
  } else if (!/^[a-zA-Z0-9\-]+$/.test(username)) {
    return {
      isValid: false,
      message: "Username should only contain letters, numbers, and hyphens", // TODO: i18n
    };
  }
  return { isValid: true };
};

/**
 * Applies filters to a DOM node
 * @param {HTMLElement} node the DOM node
 * @param {object[]} filters the list of filters to apply
 */
export const ApplyFiltersToNode = (node, filters) => {
  const usernames = filters.map((filter) => filter.username.toLowerCase());

  const username = GetUsernameForNode(node);

  if (!username) {
    console.warn("Failed to Identify Username for Deviation", node);
  } else if (usernames.includes(username.toLowerCase())) {
    SetFilterAttributesOnNode(node, username);
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
export const RemoveFiltersFromDocument = (removedFilters, _activeFilters) => {
  const usernames = removedFilters.map((filter) =>
    filter.username.toLowerCase(),
  );
  for (const username of usernames) {
    const nodes = document.querySelectorAll(
      `[da-filter-user="${username.toLowerCase()}" i]`,
    );
    for (const node of nodes) {
      RemoveFilterAttributesOnNode(node);
    }
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
 */
const SetFilterAttributesOnNode = (node, username) => {
  node.setAttribute("da-filter-user", username);
};

/**
 * Removes attributes on a DOM node for filtering (by username)
 * @param {HTMLElement} node the DOM node
 */
const RemoveFilterAttributesOnNode = (node) => {
  node.removeAttribute("da-filter-user");
};
