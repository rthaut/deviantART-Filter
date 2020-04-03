/**
 * Gets the Deviation's URL from a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the URL
 */
export const GetDeviationURLForThumbnail = (thumbnail) => {
    return thumbnail.querySelector('a[data-hook="deviation_link"]')?.getAttribute('href');
};
