import { browser } from "wxt/browser";
import { REGEX } from "../constants/url";

/**
 * Focuses the first tab matching the specified URL or opens it in a new tab
 * @param {string} url the URL to focus/show
 */
export const OpenOrShowURL = async (url) => {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    url: url,
  });

  if (tabs.length) {
    return browser.tabs.update(tabs[0].id, {
      active: true,
    });
  }

  return browser.tabs.create({
    url: url,
  });
};

/**
 * Disables the MV3 action button globally so it starts out hidden/disabled
 * everywhere, emulating the default state of an MV2 page action; `OnTabUpdate`
 * re-enables it per-tab on DeviantArt. No-op on browsers with a real page
 * action (Firefox MV2).
 */
export const InitPageActionEmulation = () => {
  if (browser.pageAction === undefined) {
    browser.action.disable();
  }
};

/**
 * Shows the page action for a tab (or, on MV3, enables the action button)
 * @param {number} tabId the ID of the tab
 */
const ShowPageAction = (tabId) =>
  browser.pageAction !== undefined
    ? browser.pageAction.show(tabId)
    : browser.action.enable(tabId);

/**
 * Hides the page action for a tab (or, on MV3, disables the action button)
 * @param {number} tabId the ID of the tab
 */
const HidePageAction = (tabId) =>
  browser.pageAction !== undefined
    ? browser.pageAction.hide(tabId)
    : browser.action.disable(tabId);

/**
 * Event handler for tab updates
 * @param {number} tabId the ID of the tab that was updated
 * @param {object} changeInfo properties about the tab's changes
 * @param {tab} tab the new state of the tab
 */
export const OnTabUpdate = (tabId, changeInfo, tab) => {
  if (REGEX.test(tab.url)) {
    ShowPageAction(tabId);
  } else {
    HidePageAction(tabId);
  }
};
