export const STORAGE_KEY = "keywords";
export const ID_PROP_NAME = "keyword";
export const UNIQUE_KEYS = ["keyword"];

export const DATA_ATTRIBUTES = ["Tags", "Title", "HTML"];

export const REQUIRES_METADATA = true;

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

export const getSelectorsForSharedFilterStyles = (filters) => {
  const selectors = [];

  filters.forEach(({ keyword, wildcard }) => {
    DATA_ATTRIBUTES.forEach((attribute) => {
      selectors.push(
        `[data-${attribute.toLowerCase()}${wildcard ? "*" : "~"}="${keyword}" i]`,
      );
    });
  });

  return selectors;
};

export const getSelectorsAndStylesForPlaceholderText = (filters) => {
  const values = [];

  filters.forEach(({ keyword, wildcard }) => {
    DATA_ATTRIBUTES.forEach((attribute) => {
      values.push([
        `[data-${attribute.toLowerCase()}${wildcard ? "*" : "~"}="${keyword}" i]`,
        [
          // TODO: update the localized message to just have placeholders for the attribute and keyword now
          `content: "${browser.i18n.getMessage("Placeholder_KeywordIn")} ${attribute}: ${keyword}" !important`,
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

  removedFilters.forEach(({ keyword, wildcard }) => {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      DATA_ATTRIBUTES.forEach((attribute) => {
        if (
          styleSheet.cssRules[i].cssText.includes(
            `[data-${attribute.toLowerCase()}${wildcard ? "*" : "~"}="${keyword}" i]`,
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
