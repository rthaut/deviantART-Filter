export const THUMBNAIL_SELECTOR = '[data-hook="deviation_link"]';

/**
 * Gets the Deviation's URL from a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the URL
 */
export const GetDeviationURLForThumbnail = (thumbnail) => {
    const selector = 'a[data-hook="deviation_link"]';

    if (thumbnail.matches(selector)) {
        return thumbnail.getAttribute('href');
    }

    return thumbnail.querySelector(selector)?.getAttribute('href');
};
