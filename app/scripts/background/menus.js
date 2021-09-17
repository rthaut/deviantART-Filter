import { AddFilter } from "./filters";
import { SHOW_FILTER_DEVIATION_MODAL } from "../constants/messages";

export const MENUS = [
  {
    id: "filter-tag",
    title: "Create Keyword Filter for this Tag",
    contexts: ["link"],
    targetUrlPatterns: ["*://*.deviantart.com/tag/*"],
  },
  {
    id: "show-filter-modal-deviation",
    title: browser.i18n.getMessage(
      "CreateFiltersFromDeviation_ContextMenuLabel"
    ),
    contexts: ["link"],
    targetUrlPatterns: ["*://*.deviantart.com/*/art/*"],
  },
];

/**
 * Initializes menus and event handlers
 */
export const InitMenus = () => {
  try {
    MENUS.forEach((menu) =>
      browser.contextMenus
        .remove(menu.id)
        .finally(browser.contextMenus.create(menu))
    );
    browser.contextMenus.onClicked.addListener(OnMenuClicked);
  } catch (ex) {
    console.error("Failed to setup context menus", ex);
  }

  try {
    browser.contextMenus.onShown.addListener(OnMenuShown);
  } catch (ex) {
    // chrome doesn't support the onShown event, but we don't use it for major functionality, so just ignore it
    void ex;
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
      if (/\/tag\/([^\/]+)/i.test(info.linkUrl)) {
        // eslint-disable-next-line no-case-declarations
        const keyword = /\/tag\/([^\/]+)/i.exec(info.linkUrl)[1];
        AddFilter("keywords", { keyword, wildcard: false });
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
 * @param {object} tab tab info
 */
// TODO: match linkUrl RegExps used here to items in MENUS array? or derive the RegExp from the targetUrlPatterns?
export const OnMenuShown = (info, tab) => {
  if (/\/tag\/([^\/]+)/i.test(info.linkUrl)) {
    // filter-tag menu
    const keyword = /\/tag\/([^\/]+)/i.exec(info.linkUrl)[1];
    UpdateMenuItem("filter-tag", {
      title: `Create Keyword Filter for "${keyword}"`,
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
