import { GetDeviationURLForThumbnail } from '../utils';

export const STORAGE_KEY = 'users';

//TODO: a VERY small portion thumbnails don't have a username available until AFTER metadata is loaded (the known case is for thumbnails of Stash items); it doesn't make sense to wait for metadata to load for all thumbnails, but having a way to re-apply this filter after metadata loads (for thumbnails that have NOT already been processed) would be useful
export const REQUIRES_METADATA = false;

const USERNAME_URL_REGEX = /([^\/]+)\/(?:art|journal|status-update)\//;

/**
* Applies filters to a given thumbnails
* @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object[]} filters the list of filters to apply
*/
export const FilterThumbnail = (thumbnail, filters) => {
    const usernames = filters.map(filter => filter.username.toLowerCase());

    const username = GetUsernameForThumbnail(thumbnail);

    if (!username) {
        console.warn('Failed to Identify Username for Thumbnail', thumbnail);
    } else if (usernames.includes(username.toLowerCase())) {
        SetFilterAttributesOnThumbnail(thumbnail, username);
    }
};

/**
 * Applies filters to the page
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} filters list of filters to apply
 * @param {string} selector CSS selector for thumbnails
 */
export const ApplyFiltersToDocument = (filters, selector) => {
    const thumbnails = document.querySelectorAll(selector);
    thumbnails.forEach(thumbnail => FilterThumbnail(thumbnail, filters));
};

/**
 * Removes filters from the page and applies remaining active filters to each unfiltered thumbnail
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} removedFilters list of filters to remove
 * @param {object[]} activeFilters list of filters that are still active (NOT used for this filter type)
 */
export const RemoveFiltersFromDocument = (removedFilters, _activeFilters) => {
    const usernames = removedFilters.map(filter => filter.username.toLowerCase());
    for (const username of usernames) {
        const thumbnails = document.querySelectorAll(`[da-filter-user="${username.toLowerCase()}" i]`);
        for (const thumbnail of thumbnails) {
            RemoveFilterAttributesOnThumbnail(thumbnail);
        }
    }
};

/**
 * Gets the username for a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @returns {string} the username
 */
export const GetUsernameForThumbnail = (thumbnail) => {
    // first look for the data-username attribute on the thumbnail,
    // then look for the first child element with the data-username attribute
    let username = thumbnail.getAttribute('data-username') || thumbnail.querySelector('[data-username]')?.getAttribute('data-username');

    if (!username) {
        const url = GetDeviationURLForThumbnail(thumbnail);
        if (USERNAME_URL_REGEX.test(url)) {
            username = USERNAME_URL_REGEX.exec(url)[1];

            // set the username attribute now to avoid parsing the URL again
            thumbnail.setAttribute('data-username', username);
        }
    }

    return username;
};

/**
 * Sets attributes on a thumbnail for filtering (by username)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {string} username the username that matched a filter
 */
const SetFilterAttributesOnThumbnail = (thumbnail, username) => {
    thumbnail.setAttribute('da-filter-user', username);
};

/**
 * Removes attributes on a thumbnail for filtering (by username)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
const RemoveFilterAttributesOnThumbnail = (thumbnail) => {
    thumbnail.removeAttribute('da-filter-user');
};
