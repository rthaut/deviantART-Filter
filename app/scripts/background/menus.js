import { AddFilter } from "../filters";
import { SHOW_FILTER_DEVIATION_MODAL } from "../constants/messages";
import { TAG_URL_REGEX, SUBMISSION_URL_REGEX } from "../constants/url";

export const MENUS = [
  {
    id: "filter-tag",
    title: browser.i18n.getMessage(
      "CreateKeywordFilterFromTag_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: ["*://*.deviantart.com/tag/*"],
  },
  {
    id: "filter-user",
    title: browser.i18n.getMessage(
      "CreateUserFilterFromDeviation_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: [
      "*://*.deviantart.com/*/art/*",
      "*://*.deviantart.com/*/journal/*",
      "*://*.deviantart.com/*/status-update/*",
    ],
  },
  {
    id: "show-filter-modal-deviation",
    title: browser.i18n.getMessage(
      "CreateFiltersFromDeviation_ContextMenuLabel",
    ),
    contexts: ["link"],
    targetUrlPatterns: [
      "*://*.deviantart.com/*/art/*",
      "*://*.deviantart.com/*/journal/*",
      "*://*.deviantart.com/*/status-update/*",
    ],
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
    case "filter-tag":
      if (TAG_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { tag: keyword } = TAG_URL_REGEX.exec(info.linkUrl).groups;
        AddFilter("keywords", { keyword, wildcard: false });
        // TODO: alert the user if keyword filters are disabled, otherwise it will seem like this failed
      }
      break;

    case "filter-user":
      if (SUBMISSION_URL_REGEX.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const { username } = SUBMISSION_URL_REGEX.exec(info.linkUrl).groups;
        AddFilter("users", { username });
        // TODO: alert the user if user filters are disabled, otherwise it will seem like this failed
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
    // filter-tag menu
    const { tag: keyword } = TAG_URL_REGEX.exec(info.linkUrl).groups;
    UpdateMenuItem("filter-tag", {
      title: browser.i18n.getMessage(
        "CreateKeywordFilterForTag_ContextMenuLabel",
        keyword,
      ),
    });
  } else if (SUBMISSION_URL_REGEX.test(info.linkUrl)) {
    // filter-user menu
    const { username } = SUBMISSION_URL_REGEX.exec(info.linkUrl).groups;
    UpdateMenuItem("filter-user", {
      title: browser.i18n.getMessage(
        "CreateUserFilterForUsername_ContextMenuLabel",
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
