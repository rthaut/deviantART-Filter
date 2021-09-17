export const THUMBNAIL_SELECTOR = "#output .thumb";

/**
 * Gets the Deviation's URL from a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the URL
 */
export const GetDeviationURLForThumbnail = (thumbnail) => {
  const selector = "[href]";

  if (thumbnail.matches(selector)) {
    return thumbnail.getAttribute("href");
  }

  return thumbnail.querySelector(selector)?.getAttribute("href");
};
