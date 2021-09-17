import { GetDeviationURLForThumbnail as Eclipse_GetDeviationURLForThumbnail } from "./eclipse";

/**
 * Gets the Deviation's URL from a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the URL
 */
export const GetDeviationURLForThumbnail = (thumbnail) =>
  Eclipse_GetDeviationURLForThumbnail(thumbnail);
