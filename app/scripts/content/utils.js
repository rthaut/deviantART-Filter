import { GetDeviationURLForThumbnail as Eclipse_GetDeviationURLForThumbnail } from './eclipse';
import { GetDeviationURLForThumbnail as Classic_GetDeviationURLForThumbnail } from './classic';

/**
 * Gets the Deviation's URL from a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the URL
 */
export const GetDeviationURLForThumbnail = (thumbnail) => {
    return Eclipse_GetDeviationURLForThumbnail(thumbnail) || Classic_GetDeviationURLForThumbnail(thumbnail);
};
