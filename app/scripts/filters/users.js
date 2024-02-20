import { SUBMISSION_URL_REGEX } from "../constants/url";

export const STORAGE_KEY = "users";
export const ID_PROP_NAME = "username";
export const UNIQUE_KEYS = ["username"];

export const DATA_ATTRIBUTES = ["username"];

// TODO: a VERY small portion DOM nodes don't have a username available until AFTER metadata is loaded (the known case is for Stash items); it doesn't make sense to wait for metadata to load for all DOM nodes, but having a way to re-apply this filter after metadata loads (for DOM nodes that have NOT already been processed) would be useful
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
  if (!username || String(username).trim().length === 0) {
    return {
      isValid: false,
      message: browser.i18n.getMessage("RequiredFieldEmptyError", [
        browser.i18n.getMessage("Filter_Users_PropTitle_Username"),
      ]),
    };
  } else if (!/^[a-zA-Z][a-zA-Z0-9\-]+$/.test(username)) {
    return {
      isValid: false,
      message: browser.i18n.getMessage(
        "Filter_Users_PropInvalidPatternError_Username",
      ),
    };
  }
  return { isValid: true };
};

export const getSelectorsForSharedFilterStyles = (filters) => {
  const selectors = [];

  filters.forEach(({ username }) => {
    DATA_ATTRIBUTES.forEach((attribute) => {
      selectors.push(`[data-${attribute.toLowerCase()}="${username}" i]`);
    });
  });

  return selectors;
};

export const getSelectorsAndStylesForPlaceholderText = (filters) => {
  const values = [];

  filters.forEach(({ username }) => {
    DATA_ATTRIBUTES.forEach((attribute) => {
      values.push([
        `[data-${attribute.toLowerCase()}="${username}" i]`,
        [
          // TODO: update the localized message to just have a placeholder for the username now
          `content: "${browser.i18n.getMessage("Placeholder_User")}: ${username}" !important`,
        ],
      ]);
    });
  });

  return values;
};

/**
 * Removes styles from the given stylesheet for the removed filters
 * Used primarily for handling added filters when local storage changes
 * @param {CSSStyleSheet} styleSheet stylesheet
 * @param {object[]} removedFilters list of filters to remove
 */
export const remove = (styleSheet, removedFilters) => {
  const indexesToRemove = [];

  removedFilters.forEach(({ username }) => {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      DATA_ATTRIBUTES.forEach((attribute) => {
        if (
          styleSheet.cssRules[i].cssText.includes(
            `[data-${attribute.toLowerCase()}="${username}" i]`,
          )
        ) {
          indexesToRemove.push(i);
        }
      });
    }
  });

  indexesToRemove.reverse();
  indexesToRemove.forEach((index) => styleSheet.deleteRule(index));
};

/**
 * Gets the username for a DOM node
 * @param {HTMLElement} node the DOM node
 * @returns {string} the username
 */
export const GetUsernameForNode = (node) => {
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
