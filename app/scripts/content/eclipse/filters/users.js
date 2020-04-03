import { THUMBNAIL_SELECTOR } from '..';
import { GetDeviationURLForThumbnail } from '../utils';

export const STORAGE_KEY = 'users';

export const REQUIRES_METADATA = false;

const USERNAME_URL_REGEX = /([^\/]+)\/art|journal/;

/**
* Applies filters to a given thumbnails
* @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object[]} filters the list of filters to apply
*/
export const FilterThumbnail = (thumbnail, filters = null) => {
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
 */
export const ApplyFiltersToDocument = (filters) => {
    // the following (unused) logic requires the metadata that is injected into thumbnails (data-username)
    // since this filter is marked as NOT requiring metadata, this is inappropriate,
    // even though it might be more efficient than the used logic further down
    // an alternative would be to querySelector links to the user's page (which have a native data-username attribute),
    // and then "jump" to the parent thumbnail node, but that becomes highly coupled to DOM structure
    // (and I don't know what sort of performance that would yield)

    /*
    const usernames = filters.map(filter => filter.username.toLowerCase());

    for (const username of usernames) {
        const thumbnails = document.querySelectorAll(`[data-username="${username.toLowerCase()}" i]`);
        for (const thumbnail of thumbnails) {
            SetFilterAttributesOnThumbnail(thumbnail, username);
        }
    }
    */

    // TODO: this is not very efficient; see above note
    const thumbnails = document.querySelectorAll(THUMBNAIL_SELECTOR);
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
        console.warn('Attempting to parse username from thumbnail link');
        const url = GetDeviationURLForThumbnail(thumbnail);
        if (USERNAME_URL_REGEX.test(url)) {
            username = USERNAME_URL_REGEX.exec(url)[1];
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
