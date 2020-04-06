export const STORAGE_KEY = 'categories';

export const REQUIRES_METADATA = true;

/**
* Applies filters to a given thumbnails
* @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object[]} filters the list of filters to apply
*/
export const FilterThumbnail = (thumbnail, filters) => {
    for (const filter of filters) {
        if (thumbnail.matches(`[data-category^="${filter.path}" i]`)) {
            SetFilterAttributesOnThumbnail(thumbnail, filter.path, 'Category');
            continue;
        }
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
 * @param {object[]} activeFilters list of filters that are still active
 */
export const RemoveFiltersFromDocument = (removedFilters, activeFilters) => {
    for (const filter of removedFilters) {
        const thumbnails = document.querySelectorAll(`[da-filter-category="${filter.path}" i]`);
        for (const thumbnail of thumbnails) {
            RemoveFilterAttributesOnThumbnail(thumbnail);
            FilterThumbnail(thumbnail, activeFilters);
        }
    }
};

/**
 * Sets attributes on a thumbnail for filtering (by category)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {string} category the category that matched a filter
 */
const SetFilterAttributesOnThumbnail = (thumbnail, category) => {
    thumbnail.setAttribute('da-filter-category', category);
};

/**
 * Removes attributes on a thumbnail for filtering (by category)
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
const RemoveFilterAttributesOnThumbnail = (thumbnail) => {
    thumbnail.removeAttribute('da-filter-category');
};
