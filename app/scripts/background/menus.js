import { ValidateAndCreateFilter } from "../filters";

import { SHOW_FILTER_DEVIATION_MODAL } from "../constants/messages";
import { SUBMISSION_URL_REGEX, TAG_URL_REGEX } from "../constants/url";

const DEVIATION_TARGET_URL_PATTERNS = [
  "*://*.deviantart.com/*/art/*",
  "*://*.deviantart.com/*/journal/*",
  "*://*.deviantart.com/*/status-update/*",
];

const TAG_TARGET_URL_PATTERNS = [
  "*://*.deviantart.com/tag/*",
  "*://*.deviantart.com/?topic=*",
];

export const MENUS = [
  {
    id: "block-tag",
    title: browser.i18n.getMessage(
      "CreateKeywordFilterFromTag_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: TAG_TARGET_URL_PATTERNS,
  },
  {
    id: "block-user",
    title: browser.i18n.getMessage(
      "CreateUserFilterFromDeviation_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: DEVIATION_TARGET_URL_PATTERNS,
  },
  {
    id: "show-filter-modal-deviation",
    title: browser.i18n.getMessage(
      "CreateFiltersFromDeviation_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: DEVIATION_TARGET_URL_PATTERNS,
  },
  {
    type: "separator",
    contexts: ["link"],
    targetUrlPatterns: [
      ...DEVIATION_TARGET_URL_PATTERNS,
      ...TAG_TARGET_URL_PATTERNS,
    ],
  },
  {
    id: "allow-tag",
    title: browser.i18n.getMessage(
      "CreateAllowedKeywordFilterFromTag_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: TAG_TARGET_URL_PATTERNS,
  },
  {
    id: "allow-user",
    title: browser.i18n.getMessage(
      "CreateAllowedUserFilterFromDeviation_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: DEVIATION_TARGET_URL_PATTERNS,
  },
];

/**
 * Initializes menus and event handlers
 */
export const InitMenus = async () => {
  try {
    await browser.contextMenus.removeAll();
    await Promise.all(MENUS.map((menu) => browser.contextMenus.create(menu)));
    browser.contextMenus.onClicked.addListener(OnMenuClicked);
  } catch (ex) {
    console.error("Failed to setup context menus", ex);
  }

  if (typeof browser.contextMenus.onShown !== "undefined") {
    try {
      browser.contextMenus.onShown.addListener(OnMenuShown);
    } catch (ex) {
      void ex;
    }
  }
};

/**
 * Event handler for when a menu item is clicked
 * @param {object} info menu info
 * @param {object} tab tab info
 */
export const OnMenuClicked = (info, tab) => {
  switch (info.menuItemId) {
    case "allow-tag":
      if (TAG_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { tag: keyword } = TAG_URL_REGEX.exec(info.linkUrl).groups;
        // TODO: use a new runtime message to apply the filter to the DOM (before validating+storing it)?
        ValidateAndCreateFilter("keywords", {
          keyword: keyword.replace(/[^a-zA-Z0-9\_]/g, ""),
          wildcard: false,
          type: "allowed",
        });
      }
      break;

    case "allow-user":
      if (SUBMISSION_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { username } = SUBMISSION_URL_REGEX.exec(info.linkUrl).groups;
        // TODO: use a new runtime message to apply the filter to the DOM (before validating+storing it)?
        ValidateAndCreateFilter("users", { username, type: "allowed" });
      }
      break;

    case "block-tag":
      if (TAG_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { tag: keyword } = TAG_URL_REGEX.exec(info.linkUrl).groups;
        // TODO: use a new runtime message to apply the filter to the DOM (before validating+storing it)?
        ValidateAndCreateFilter("keywords", {
          keyword: keyword.replace(/[^a-zA-Z0-9\_]/g, ""),
          wildcard: false,
          type: "blocked",
        });
      }
      break;

    case "block-user":
      if (SUBMISSION_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { username } = SUBMISSION_URL_REGEX.exec(info.linkUrl).groups;
        // TODO: use a new runtime message to apply the filter to the DOM (before validating+storing it)?
        ValidateAndCreateFilter("users", { username, type: "blocked" });
      }
      break;

    case "show-filter-modal-deviation":
      browser.tabs.sendMessage(tab.id, {
        action: SHOW_FILTER_DEVIATION_MODAL,
        data: {
          link: info.linkUrl,
        },
      });
      break;

    default:
      break;
  }
};

/**
 * Event handler for when a menu is shown (Firefox only)
 * @param {object} info menu info
 * @param {object} _tab tab info
 */
// TODO: match linkUrl RegExps used here to items in MENUS array? or derive the RegExp from the targetUrlPatterns?
export const OnMenuShown = (info, _tab) => {
  if (TAG_URL_REGEX.test(info.linkUrl)) {
    // block-tag menu
    const { tag: keyword } = TAG_URL_REGEX.exec(info.linkUrl).groups;
    UpdateMenuItem("block-tag", {
      title: browser.i18n.getMessage(
        "CreateKeywordFilterForTag_ContextMenuLabel",
        keyword,
      ),
    });
    UpdateMenuItem("allow-tag", {
      title: browser.i18n.getMessage(
        "CreateAllowedKeywordFilterForTag_ContextMenuLabel",
        keyword,
      ),
    });
  } else if (SUBMISSION_URL_REGEX.test(info.linkUrl)) {
    // block-user menu
    const { username } = SUBMISSION_URL_REGEX.exec(info.linkUrl).groups;
    UpdateMenuItem("block-user", {
      title: browser.i18n.getMessage(
        "CreateUserFilterForUsername_ContextMenuLabel",
        username,
      ),
    });
    UpdateMenuItem("allow-user", {
      title: browser.i18n.getMessage(
        "CreateAllowedUserFilterForUsername_ContextMenuLabel",
        username,
      ),
    });
  }
};

/**
 * Updates and refreshes an existing menu item
 * @param {string} id the ID of the item to update
 * @param {object} properties the properties to update
 */
const UpdateMenuItem = (id, properties) => {
  browser.contextMenus.update(id, properties);
  browser.contextMenus.refresh();
};
