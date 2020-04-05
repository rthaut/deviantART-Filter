import { SetMetadataOnThumbnail } from './metadata';
import * as CategoriesFilter from './filters/categories';
import * as KeywordsFilter from './filters/keywords';
import * as UsersFilter from './filters/users';
export const FILTERS = [
    CategoriesFilter,
    KeywordsFilter,
    UsersFilter
];

import { ADD_FILTER } from '../../constants/messages';

export const THUMBNAIL_SELECTOR = '[data-hook="deviation_std_thumb"]';

/**
 * Adds the quick hide control to the given thumbnails
 * @param {HTMLElement[]} thumbnails the list of thumbnail DOM nodes
 */
const AddQuickHideControl = (thumbnails) => {
    for (const thumbnail of thumbnails) {
        let control = thumbnail.querySelector('a.hide-user-corner');
        if (control === undefined || control === null) {
            const username = UsersFilter.GetUsernameForThumbnail(thumbnail);

            if (!username) {
                console.warn('Failed to Identify Username for Thumbnail', thumbnail);
                continue;
            }

            if (username !== undefined && username !== null) {
                control = document.createElement('div');
                control.setAttribute('da-filter-quick-hide', username);
                control.addEventListener('click', async (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    // immediately filter this thumbnails
                    // OnLocalStorageChanged() will catch the change, too, but for large filter lists,
                    // it will be delayed
                    UsersFilter.FilterThumbnail(thumbnail, [{ username }]);

                    browser.runtime.sendMessage({
                        'action': ADD_FILTER,
                        'data': {
                            'key': 'users',
                            'value': { username }
                        }
                    });
                }, false);
                thumbnail.appendChild(control);
            }
        }
    }
};

/**
 * Event handler for local storage changes
 * @param {string} changes the local storage changes
 */
export const OnLocalStorageChanged = async (key, changes) => {
    for (const F of FILTERS) {
        if (key === F.STORAGE_KEY) {
            const { added, removed, newValue } = changes;

            if (added.length) {
                console.debug('Applying new filters to document', added);
                console.time(`ApplyFiltersToDocument() [${key}]`);
                F.ApplyFiltersToDocument(added);
                console.timeEnd(`ApplyFiltersToDocument() [${key}]`);
            }

            if (removed.length) {
                console.debug('Removing old filters from document', removed);
                console.time(`RemoveFiltersFromDocument() [${key}]`);
                F.RemoveFiltersFromDocument(removed, newValue);
                console.timeEnd(`RemoveFiltersFromDocument() [${key}]`);
            }
        }
    }
};

/**
 * Runs all applicable logic on thumbnails (applying metadata, filtering, etc.)
 * @param {HTMLElement[]} thumbnails the list of thumbnail DOM nodes
 */
export const HandleThumbnails = async (thumbnails) => {
    AddQuickHideControl(thumbnails);

    const data = {};
    for (const F of FILTERS) {
        const storageData = await browser.storage.local.get(F.STORAGE_KEY);
        data[F.STORAGE_KEY] = storageData[F.STORAGE_KEY] ?? [];
    }

    // start loading metadata and applying filters that do require metadata first (asynchronously)
    thumbnails.forEach(async (thumbnail) => {
        try {
            await SetMetadataOnThumbnail(thumbnail);
        } catch (e) {
            console.error('Failed to set metadata on thumbnail', e, thumbnail);
        }

        FILTERS
            .filter(F => F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
            .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
    });

    // apply filters that do NOT require metadata last
    thumbnails.forEach(thumbnail => {
        FILTERS
            .filter(F => !F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
            .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
    });
};
