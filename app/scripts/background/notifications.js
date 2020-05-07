import { OpenOrShowURL } from './tabs';

import { TAG_FILTERS_MIGRATED } from '../constants/notifications';

/**
 * Event handler for notification clicks
 * @param {string} notificationId the ID of the clicked notification
 */
export const OnNotificationClicked = (notificationId) => {
    switch (notificationId) {
        case TAG_FILTERS_MIGRATED:
            OpenOrShowURL(browser.runtime.getURL('pages/manage.html#/keywords'));
            break;
    }

    return browser.notifications.clear(notificationId);
};
