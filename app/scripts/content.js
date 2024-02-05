import {
  LOCAL_STORAGE_CHANGED,
  SHOW_FILTER_DEVIATION_MODAL,
  HIDE_FILTER_DEVIATION_MODAL,
} from "./constants/messages";

import { PAGES } from "./constants/url";

import { SetMetadataOnNode } from "./content/metadata";

import { ENABLED_FILTERS_STORAGE_KEY, GetEnabledFilters } from "./filters";
import * as KeywordsFilter from "./filters/keywords";
import * as UsersFilter from "./filters/users";

const SELECTORS = [
  `a[href*="deviantart.com/"][href*="/art/"]`,
  `a[href*="deviantart.com/"][href*="/journal/"]`,
  `a[href*="deviantart.com/"][href*="/status-update/"]`,
];

const FILTERS = [KeywordsFilter, UsersFilter];

let pageIsEnabled = true;

/**
 * Runs all applicable logic on DOM nodes (applying metadata, filtering, etc.)
 * @param {HTMLElement[]} nodes the collection of DOM nodes
 */
export const HandleNodes = async (nodes) => {
  const data = {};
  for (const F of FILTERS.filter((F) => F.IS_ENABLED)) {
    const storageData = await browser.storage.local.get(F.STORAGE_KEY);
    data[F.STORAGE_KEY] = storageData[F.STORAGE_KEY] ?? [];
  }

  // start loading metadata and applying filters that do require metadata first (asynchronously)
  nodes.forEach(async (node) => {
    let metadataApplied = true;
    try {
      await SetMetadataOnNode(node);
    } catch (error) {
      console.error("Failed to set metadata on node", node, error);
      metadataApplied = false;
    }

    if (metadataApplied) {
      FILTERS.filter(
        (F) =>
          F.REQUIRES_METADATA &&
          data[F.STORAGE_KEY] &&
          data[F.STORAGE_KEY].length,
      ).forEach((F) => F.ApplyFiltersToNode(node, data[F.STORAGE_KEY]));
    }
  });

  // apply filters that do NOT require metadata last
  nodes.forEach((node) => {
    FILTERS.filter(
      (F) =>
        !F.REQUIRES_METADATA &&
        data[F.STORAGE_KEY] &&
        data[F.STORAGE_KEY].length,
    ).forEach((F) => F.ApplyFiltersToNode(node, data[F.STORAGE_KEY]));
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

  if (key === ENABLED_FILTERS_STORAGE_KEY) {
    const { newValue: enabledFilters } = changes;
    for (const F of FILTERS) {
      F.IS_ENABLED = enabledFilters.includes(F.STORAGE_KEY);

      if (!F.IS_ENABLED) {
        F.DisableFilter();
      } else {
        HandleNodes(document.querySelectorAll(SELECTORS.join(", ")));
      }
    }
    return;
  }

  for (const F of FILTERS) {
    if (key === F.STORAGE_KEY && F.IS_ENABLED) {
      const { added, removed, newValue } = changes;

      if (added.length) {
        F.ApplyFiltersToDocument(added, SELECTORS.join(", "));
      }

      if (removed.length) {
        F.RemoveFiltersFromDocument(removed, newValue);
      }
    }
  }
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
 * Gets the value of an option specific to placeholder functionality from storage
 * @param {string} optionName the placeholder option name
 * @param {*} defaultValue the default value (if the option is not set in storage)
 * @returns {*} the value of the placeholder option from storage (or the supplied default value)
 */
const GetPlaceholderOption = async (optionName, defaultValue) => {
  const data = await browser.storage.local.get("options");
  return data?.options?.placeholders?.[optionName] ?? defaultValue;
};

/**
 * Run once the content script is loaded
 */
(async () => {
  // create the filter frame first so it responds to messages
  InitFilterFrame();

  pageIsEnabled = !(await IsPageDisabled(window.location));

  const enabledFilters = await GetEnabledFilters();
  for (const F of FILTERS) {
    F.IS_ENABLED = enabledFilters.includes(F.STORAGE_KEY);
  }

  // setup message handlers as soon as we are ready to receive them
  if (!browser.runtime.onMessage.hasListener(OnRuntimeMessage)) {
    browser.runtime.onMessage.addListener(OnRuntimeMessage);
  }

  if (pageIsEnabled) {
    document.body.classList.add("enable-metadata-indicators");

    if (!(await GetPlaceholderOption("preventClick", true))) {
      document.body.classList.add("clickable-placeholders");
    }

    if (!(await GetPlaceholderOption("showFilterText", true))) {
      document.body.classList.add("hide-placeholder-text");
    }

    // setup observers for nodes loaded after initial render next
    WatchForNewNodes(SELECTORS.join(", "));

    // get all existing nodes on the page and work with them
    await HandleNodes(document.querySelectorAll(SELECTORS.join(", ")));
  }
})();
