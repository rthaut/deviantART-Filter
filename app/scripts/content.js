import {
  LOCAL_STORAGE_CHANGED,
  SHOW_FILTER_DEVIATION_MODAL,
  HIDE_FILTER_DEVIATION_MODAL,
} from "./constants/messages";
import { OPTIONS_STORAGE_KEY } from "./constants/options";
import { PAGES } from "./constants/url";

import { SetMetadataOnNode } from "./content/metadata";
import { ApplyAttributesForOptions, GetOptions } from "./content/options";

import { ENABLED_FILTERS_STORAGE_KEY, GetEnabledFilters } from "./filters";

import * as KeywordsFilter from "./filters/keywords";
import * as UsersFilter from "./filters/users";
const FILTERS = [KeywordsFilter, UsersFilter];

const SELECTORS = [
  `a[href*="deviantart.com/"][href*="/art/"]`,
  `a[href*="deviantart.com/"][href*="/journal/"]`,
  `a[href*="deviantart.com/"][href*="/status-update/"]`,
];

let pageIsEnabled = true;
let metadataEnabled = true;

const IsFilterEnabled = (filterKey) =>
  document.body.hasAttribute("da-filter-enabled") &&
  document.body
    .getAttribute("da-filter-enabled")
    .split(" ")
    .includes(filterKey);

/**
 * Runs all applicable logic on DOM nodes (applying metadata, filtering, etc.)
 * @param {HTMLElement[]} nodes the collection of DOM nodes
 */
export const HandleNodes = async (nodes) => {
  const FILTER_DATA = {};

  for (const F of FILTERS.filter((F) => IsFilterEnabled(F.STORAGE_KEY))) {
    const data = await browser.storage.local.get({
      [F.STORAGE_KEY]: [],
    });
    FILTER_DATA[F.STORAGE_KEY] = F.SplitFilters(data[F.STORAGE_KEY]);
  }

  if (metadataEnabled) {
    // start loading metadata and applying filters that do require metadata first (asynchronously)
    nodes.forEach((node) => {
      SetMetadataOnNode(node).then((metadataApplied) => {
        if (metadataApplied) {
          FILTERS.filter(
            (F) =>
              F.REQUIRES_METADATA && FILTER_DATA[F.STORAGE_KEY] !== undefined,
          ).forEach((F) =>
            F.ApplyFiltersToNode(node, FILTER_DATA[F.STORAGE_KEY]),
          );
        }
      });
    });
  }

  // apply filters that do NOT require metadata last
  nodes.forEach((node) => {
    FILTERS.filter(
      (F) => !F.REQUIRES_METADATA && FILTER_DATA[F.STORAGE_KEY] !== undefined,
    ).forEach((F) => F.ApplyFiltersToNode(node, FILTER_DATA[F.STORAGE_KEY]));
  });
};

/**
 * Uses a MutationObserver to watch for the insertion of new DOM nodes
 */
const WatchForNewNodes = (selector) => {
  const observer = new MutationObserver(async (mutations) => {
    // using a Set for nodes for native de-duplication
    let nodes = new Set();

    for (const { addedNodes } of mutations) {
      for (const addedNode of addedNodes) {
        if (typeof addedNode.matches === "function") {
          if (addedNode.matches(selector)) {
            nodes.add(addedNode);
          }
        }

        if (typeof addedNode.querySelectorAll === "function") {
          const addedNodeChildNodes = addedNode.querySelectorAll(selector);
          if (addedNodeChildNodes.length) {
            nodes = new Set([...nodes, ...addedNodeChildNodes]);
          }
        }
      }
    }

    if (nodes.size) {
      await HandleNodes(nodes);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};

/**
 * Event handler for local storage changes
 * @param {string} changes the local storage changes
 */
export const OnLocalStorageChanged = async (key, changes) => {
  if (!pageIsEnabled) {
    return;
  }

  if (key === OPTIONS_STORAGE_KEY) {
    const { newValue: options } = changes;
    ApplyAttributesForOptions(options);
    return;
  }

  if (key === ENABLED_FILTERS_STORAGE_KEY) {
    const { newValue: enabledFilters } = changes;
    document.body.setAttribute("da-filter-enabled", enabledFilters.join(" "));
    for (const F of FILTERS) {
      if (!enabledFilters.includes(F.STORAGE_KEY)) {
        F.DisableFilter();
      }
    }
  } else {
    const { removed: removedFilters, added: addedFilters } = changes;

    if (addedFilters.length) {
      for (const F of FILTERS) {
        if (key === F.STORAGE_KEY && IsFilterEnabled(F.STORAGE_KEY)) {
          F.ApplyFiltersToDocument(addedFilters);
        }
      }
    }

    if (removedFilters.length) {
      for (const F of FILTERS) {
        if (key === F.STORAGE_KEY) {
          F.RemoveFiltersFromDocument(removedFilters);
        }
      }
    }
  }

  // re-apply ALL filters to the page, since we may have added or removed an "allowed" filter
  // that was preventing a "blocked" filter from being applied previously
  await HandleNodes(document.querySelectorAll(SELECTORS.join(", ")));
};

/**
 * Event handler for runtime messages
 * @param {object} message the message
 */
const OnRuntimeMessage = (message) => {
  switch (message.action) {
    case LOCAL_STORAGE_CHANGED:
      OnLocalStorageChanged(message.data.key, message.data.changes);
      break;

    case SHOW_FILTER_DEVIATION_MODAL:
      InitFilterFrame();
      ShowFilterFrame(message.data.link);
      break;

    case HIDE_FILTER_DEVIATION_MODAL:
      HideFilterFrame();
      break;
  }
};

const InitFilterFrame = () => {
  const id = "filter-frame";
  let iframe = document.getElementById(id);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("id", id);
    iframe.setAttribute("role", "dialog");
    iframe.setAttribute(
      "src",
      browser.runtime.getURL("pages/create-filters.html"),
    );
    Object.assign(iframe.style, {
      display: "none",
      zIndex: 9999,
      margin: 0,
      padding: 0,
      background: "transparent",
      border: "none",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
    });
    document.body.prepend(iframe);
  }
};

const ShowFilterFrame = () => {
  const iframe = document.getElementById("filter-frame");
  if (iframe) {
    document.body.style.overflowY = "hidden";
    iframe.style.display = "block";
  }
};

const HideFilterFrame = () => {
  const iframe = document.getElementById("filter-frame");
  if (iframe) {
    iframe.style.display = "none";
    document.body.style.overflowY = "";
  }
};

/**
 * Determines if the user has disabled DeviantArt Filter for the current page
 */
const IsPageDisabled = async (url) => {
  const data = await browser.storage.local.get("options");

  const pages = data?.options?.pages;
  if (pages !== undefined && Object.keys(pages).length) {
    const pageURL = new URL(url);

    const disabledPages = Object.keys(pages).filter(
      (page) => pages[page] === false,
    );
    for (const page of disabledPages) {
      let matches = true;

      const properties = PAGES[page];
      for (const prop of Object.keys(properties)) {
        matches =
          matches &&
          properties[prop].some((pattern) => pageURL[prop].match(pattern));
      }

      if (matches) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Run once the content script is loaded
 */
(async () => {
  // create the filter frame first so it responds to messages
  InitFilterFrame();

  pageIsEnabled = !(await IsPageDisabled(window.location));

  const enabledFilters = await GetEnabledFilters();
  document.body.setAttribute("da-filter-enabled", enabledFilters.join(" "));

  // setup message handlers as soon as we are ready to receive them
  if (!browser.runtime.onMessage.hasListener(OnRuntimeMessage)) {
    browser.runtime.onMessage.addListener(OnRuntimeMessage);
  }

  if (pageIsEnabled) {
    const options = await GetOptions();

    metadataEnabled = options.metadata.enabled !== false;

    ApplyAttributesForOptions(options);

    // setup observers for nodes loaded after initial render next
    WatchForNewNodes(SELECTORS.join(", "));

    // get all existing nodes on the page and work with them
    await HandleNodes(document.querySelectorAll(SELECTORS.join(", ")));
  }
})();
