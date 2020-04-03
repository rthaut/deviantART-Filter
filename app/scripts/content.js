import {
    THUMBNAIL_SELECTOR,
    OnLocalStorageChanged,
    HandleThumbnails,
} from './content/eclipse';

import { LOCAL_STORAGE_CHANGED } from './constants/messages';

// TODO:    if (and __BIG__ if) this is going to support both Eclipse and classic,
//          then we need to identify which version of the site is in use and utilize
//          the corresponding files/functionality - blindly using both will hurt performance

/**
 * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes
 */
const WatchForNewThumbs = (selector) => {
    const observer = new MutationObserver(async (mutations) => {
        // using a Set for thumbnails for native de-duplication
        let thumbnails = new Set();

        for (const { addedNodes } of mutations) {
            for (const addedNode of addedNodes) {
                const addedNodeThumbnails = addedNode.querySelectorAll(selector);
                if (addedNodeThumbnails.length) {
                    thumbnails = new Set([...thumbnails, ...addedNodeThumbnails]);
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

    // setup observer for thumbnails loaded after initial render next
    WatchForNewThumbs(THUMBNAIL_SELECTOR);

    // get all thumbnails on the page and work with them
    const thumbnails = document.querySelectorAll(THUMBNAIL_SELECTOR);
    await HandleThumbnails(thumbnails);

})();
