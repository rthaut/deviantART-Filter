import { THUMBNAIL_SELECTOR } from '..';

export const STORAGE_KEY = 'keywords';

export const REQUIRES_METADATA = true;

/**
* Applies filters to a given thumbnails
* @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object[]} filters the list of filters to apply
*/
export const FilterThumbnail = (thumbnail, filters) => {
    for (const filter of filters) {
        const operator = filter.wildcard ? '*' : '~';
        if (thumbnail.matches(`[data-tags${operator}="${filter.keyword}" i]`)) {
            SetFilterAttributesOnThumbnail(thumbnail, filter.keyword, 'Tags');
            continue;
        } else if (thumbnail.matches(`[data-title${operator}="${filter.keyword}" i]`)) {
            SetFilterAttributesOnThumbnail(thumbnail, filter.keyword, 'Title');
            continue;
        }
    }
};

/**
 * Applies filters to the page
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} filters list of filters to apply
 */
export const ApplyFiltersToDocument = (filters) => {
    const thumbnails = document.querySelectorAll(THUMBNAIL_SELECTOR);
    thumbnails.forEach(thumbnail => FilterThumbnail(thumbnail, filters));
};

/**
 * Removes filters from the page and applies remaining active filters to each unfiltered thumbnail
 * Used primarily for handling added filters when local storage changes
 * @param {object[]} removedFilters list of filters to remove
 * @param {object[]} activeFilters list of filters that are still active
 */
export const RemoveFiltersFromDocument = (removedFilters, activeFilters) => {
    for (const filter of removedFilters) {
        const thumbnails = document.querySelectorAll(`[da-filter-keyword="${filter.keyword}" i]`);
        for (const thumbnail of thumbnails) {
            RemoveFilterAttributesOnThumbnail(thumbnail);
            FilterThumbnail(thumbnail, activeFilters);
        }
    }
};

/**
 * Sets attributes on a thumbnail for filtering (by keyword)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {string} keyword the keyword that matched a filter
 * @param {string} [attribute] the thumbnail attribute that matched a filter
 */
const SetFilterAttributesOnThumbnail = (thumbnail, keyword, attribute = null) => {
    thumbnail.setAttribute('da-filter-keyword', keyword);

    if (attribute) {
        thumbnail.setAttribute('da-filter-keyword-attribute', attribute);
    }
};

/**
 * Removes attributes on a thumbnail for filtering (by keyword)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
const RemoveFilterAttributesOnThumbnail = (thumbnail) => {
    thumbnail.removeAttribute('da-filter-keyword');
    thumbnail.removeAttribute('da-filter-keyword-attribute');
};
