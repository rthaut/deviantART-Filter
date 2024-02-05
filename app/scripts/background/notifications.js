import { OpenOrShowURL } from "./tabs";

import {
  FILTER_NOT_CREATED,
  FILTER_TYPE_DISABLED,
  TAG_FILTERS_MIGRATED,
} from "../constants/notifications";

/**
 * Event handler for notification clicks
 * @param {string} notificationId the ID of the clicked notification
 */
export const OnNotificationClicked = (notificationId) => {
  switch (notificationId) {
    case TAG_FILTERS_MIGRATED:
      OpenOrShowURL(browser.runtime.getURL("pages/manage.html#/keywords"));
      break;

    case `keywords-${FILTER_NOT_CREATED}`:
    case `keywords-${FILTER_TYPE_DISABLED}`:
      OpenOrShowURL(browser.runtime.getURL("pages/manage.html#/keywords"));
      break;

    case `users-${FILTER_NOT_CREATED}`:
    case `users-${FILTER_TYPE_DISABLED}`:
      OpenOrShowURL(browser.runtime.getURL("pages/manage.html#/users"));
      break;
  }

  return browser.notifications.clear(notificationId);
};
