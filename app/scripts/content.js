import { THUMBNAIL_SELECTOR as ECLIPSE_THUMBNAIL_SELECTOR } from './content/eclipse';
import { THUMBNAIL_SELECTOR as CLASSIC_THUMBNAIL_SELECTOR } from './content/classic';

import {
    ADD_FILTER,
    LOCAL_STORAGE_CHANGED,
} from './constants/messages';

import { SetMetadataOnThumbnail } from './content/metadata';

import * as CategoriesFilter from './content/filters/categories';
import * as KeywordsFilter from './content/filters/keywords';
import * as UsersFilter from './content/filters/users';
const FILTERS = [
    CategoriesFilter,
    KeywordsFilter,
    UsersFilter
];

/**
 * Adds the quick hide control to the given thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
const AddQuickHideControl = (thumbnail) => {
    let control = thumbnail.querySelector('span[da-filter-quick-hide]');
    if (control === undefined || control === null) {
        const username = UsersFilter.GetUsernameForThumbnail(thumbnail);

        if (!username) {
            console.warn('Failed to Identify Username for Thumbnail', thumbnail);
        }

        if (username !== undefined && username !== null) {
            control = document.createElement('span');
            control.setAttribute('da-filter-quick-hide', username);
            control.setAttribute('title', `Create User Filter for "${username}"`);
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
    } else {
        console.info('Quick Hide Control already exists for thumbnail', control);
    }
};

/**
 * Runs all applicable logic on thumbnails (applying metadata, filtering, etc.)
 * @param {HTMLElement[]} thumbnails the list of thumbnail DOM nodes
 */
export const HandleThumbnails = async (thumbnails) => {
    thumbnails.forEach(thumbnail => AddQuickHideControl(thumbnail));

    const data = {};
    for (const F of FILTERS) {
        const storageData = await browser.storage.local.get(F.STORAGE_KEY);
        data[F.STORAGE_KEY] = storageData[F.STORAGE_KEY] ?? [];
    }

    // start loading metadata and applying filters that do require metadata first (asynchronously)
    thumbnails.forEach(async (thumbnail) => {
        let metadataApplied = true;
        try {
            await SetMetadataOnThumbnail(thumbnail);
        } catch (e) {
            console.error('Failed to set metadata on thumbnail', e, thumbnail);
            metadataApplied = false;
        }

        if (metadataApplied) {
            // TODO: we could invoke `AddQuickHideControl()` here, but for 99% of thumbnails we don't need to wait for metadata; ideally we keep a list of thumbnails to retry and handle them here
            FILTERS
                .filter(F => F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
                .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
        }
    });

    // apply filters that do NOT require metadata last
    thumbnails.forEach(thumbnail => {
        FILTERS
            .filter(F => !F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
            .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
    });
};


/**
 * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes
 */
const WatchForNewThumbs = (selector) => {
    const observer = new MutationObserver(async (mutations) => {
        // using a Set for thumbnails for native de-duplication
        let thumbnails = new Set();

        for (const { addedNodes } of mutations) {
            for (const addedNode of addedNodes) {
                if (typeof addedNode.matches === 'function') {
                    if (addedNode.matches(selector)) {
                        thumbnails.add(addedNode);
                    }
                }

                if (typeof addedNode.querySelectorAll === 'function') {
                    const addedNodeThumbnails = addedNode.querySelectorAll(selector);
                    if (addedNodeThumbnails.length) {
                        thumbnails = new Set([...thumbnails, ...addedNodeThumbnails]);
                    }
                }
            }
        }

        if (thumbnails.size) {
            await HandleThumbnails(thumbnails);
        }
    });

    observer.observe(document, {
        'childList': true,
        'subtree': true
    });
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
                F.ApplyFiltersToDocument(added, ECLIPSE_THUMBNAIL_SELECTOR);
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
 * Event handler for runtime messages
 * @param {object} message the message
 */
const OnRuntimeMessage = message => {
    console.debug('Message from background script', message);
    switch (message.action) {
        case LOCAL_STORAGE_CHANGED:
            OnLocalStorageChanged(message.data.key, message.data.changes);
            break;
    }
};

/**
 * Run once the content script is loaded
 */
(async () => {

    // setup message handlers first
    if (!browser.runtime.onMessage.hasListener(OnRuntimeMessage)) {
        browser.runtime.onMessage.addListener(OnRuntimeMessage);
    }

    // setup observers for thumbnails loaded after initial render next
    WatchForNewThumbs(ECLIPSE_THUMBNAIL_SELECTOR);
    WatchForNewThumbs(CLASSIC_THUMBNAIL_SELECTOR);

    // get all thumbnails on the page and work with them
    await HandleThumbnails(document.querySelectorAll(ECLIPSE_THUMBNAIL_SELECTOR));
    await HandleThumbnails(document.querySelectorAll(CLASSIC_THUMBNAIL_SELECTOR));

})();
