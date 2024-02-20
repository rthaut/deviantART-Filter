import {
  LOCAL_STORAGE_CHANGED,
  SHOW_FILTER_DEVIATION_MODAL,
  HIDE_FILTER_DEVIATION_MODAL,
} from "./constants/messages";
import { DEFAULT_OPTIONS, OPTIONS_STORAGE_KEY } from "./constants/options";
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
let metadataEnabled = true;

/**
 * Runs all applicable logic on deviation link nodes (applying metadata, filtering, etc.)
 * @param {HTMLAnchorElement[]} deviationLinks the collection of deviation link nodes
 */
export const handleDeviationLinks = (deviationLinks) => {
  deviationLinks.forEach((linkNode) => {
    // find the parent-most unique DOM node that contains this link node
    let targetNode = linkNode;
    while (
      targetNode.parentNode.querySelectorAll(
        [
          `a[href*="/art/"]:not([href^="${linkNode.href}"])`,
          `a[href*="/journal/"]:not([href^="${linkNode.href}"])`,
          `a[href*="/status-update/"]:not([href^="${linkNode.href}"])`,
        ].join(),
      ).length === 0
    ) {
      targetNode = targetNode.parentNode;
    }

    targetNode.setAttribute("da-filter-node", "link-wrapper");

    if (metadataEnabled) {
      try {
        SetMetadataOnNode(linkNode);
      } catch (error) {
        console.error("Failed to set metadata on node", linkNode, error);
      }
    }
  });
};

/**
 * Uses a MutationObserver to watch for the insertion of new DOM nodes
 */
const watchForNewNodes = (selector) => {
  const observer = new MutationObserver((mutations) => {
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
      handleDeviationLinks(nodes);
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
export const onLocalStorageChanged = (key, changes) => {
  if (!pageIsEnabled) {
    return;
  }

  if (key === OPTIONS_STORAGE_KEY) {
    const { newValue: options } = changes;
    applyAttributesForOptions(options);
    return;
  }

  if (key === ENABLED_FILTERS_STORAGE_KEY) {
    const { newValue: enabledFilters } = changes;
    for (const F of FILTERS) {
      const wasEnabled = !isFilterDisabled(F.STORAGE_KEY);
      const isEnabled = enabledFilters.includes(F.STORAGE_KEY);

      if (wasEnabled && !isEnabled) {
        setFilterDisabledAttribute(F.STORAGE_KEY);
      } else if (!wasEnabled && isEnabled) {
        setFilterEnabledAttribute(F.STORAGE_KEY);
      }
    }
    return;
  }

  for (const F of FILTERS) {
    if (key === F.STORAGE_KEY) {
      const { added, removed } = changes;

      if (added.length) {
        applyFilter(F, added);
      }

      if (removed.length) {
        F.remove(F.styleSheet, removed);
      }
    }
  }
};

/**
 * Event handler for runtime messages
 * @param {object} message the message
 */
const onRuntimeMessage = (message) => {
  switch (message.action) {
    case LOCAL_STORAGE_CHANGED:
      onLocalStorageChanged(message.data.key, message.data.changes);
      break;

    case SHOW_FILTER_DEVIATION_MODAL:
      initFilterFrame();
      showFilterFrame(message.data.link);
      break;

    case HIDE_FILTER_DEVIATION_MODAL:
      hideFilterFrame();
      break;
  }
};

const initFilterFrame = () => {
  const id = "da-filter-modal-frame";
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

const showFilterFrame = () => {
  const iframe = document.getElementById("da-filter-modal-frame");
  if (iframe) {
    document.body.style.overflowY = "hidden";
    iframe.style.display = "block";
  }
};

const hideFilterFrame = () => {
  const iframe = document.getElementById("da-filter-modal-frame");
  if (iframe) {
    iframe.style.display = "none";
    document.body.style.overflowY = "";
  }
};

/**
 * Determines if the user has disabled DeviantArt Filter for the current page
 */
const isPageDisabled = async (url) => {
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

const setFilterDisabledAttribute = (filterKey) => {
  document.body.setAttribute(
    "da-filter-disabled",
    Array.from(
      new Set([
        ...(document.body.getAttribute("da-filter-disabled") ?? "").split(" "),
        filterKey,
      ]),
    ).join(" "),
  );
};

const setFilterEnabledAttribute = (filterKey) => {
  document.body.setAttribute(
    "da-filter-disabled",
    (document.body.getAttribute("da-filter-disabled") ?? "")
      .split(" ")
      .filter((filter) => filter !== filterKey)
      .join(" "),
  );
};

const isFilterDisabled = (filterKey) => {
  return (document.body.getAttribute("da-filter-disabled") ?? "")
    .split(" ")
    .includes(filterKey);
};

/**
 * Gets all options from extension storage
 * @returns {object} the options as a structured object
 */
const GetOptions = async () => {
  const { options } = await browser.storage.local.get({
    [OPTIONS_STORAGE_KEY]: DEFAULT_OPTIONS,
  });
  return options;
};

const applyAttributesForOptions = (options) => {
  document.body.setAttribute(
    "da-filter-untagged",
    options.filterUntaggedSubmissionTypes.join(" "),
  );

  const metadataAttributes = [];
  if (options.metadata?.missingMetadataIndicators) {
    metadataAttributes.push("indicate-missing");
  }
  if (options.metadata?.loadedMetadataIndicators) {
    metadataAttributes.push("indicate-loaded");
  }

  document.body.setAttribute(
    "da-filter-metadata",
    metadataAttributes.join(" "),
  );

  const placeholderAttributes = [];
  if (options.placeholders?.disabled) {
    // TODO: expose an option for completely "disabling" placeholders if it is ever feasible
    // for now, though, disabling placeholders is difficult (impossible, even?) for at least 2 reasons:
    // 1) we need to target the parent-most unique DOM node containing the filtered deviation's link
    //    this is non-trivial due to inconsistent DOM structures for thumbnails across the site,
    //    although there may be some `:has()` wizardry to do it via CSS selectors in modern browsers
    // 2) we would then have to re-arrange the layout(s) due to DeviantArt using explicit grids
    //    again this is non-trivial due to inconsistent DOM structures across the site
    placeholderAttributes.push("disabled");
  } else {
    if (options.placeholders?.preventClick) {
      placeholderAttributes.push("prevent-click");
    }
    if (options.placeholders?.showFilterText) {
      placeholderAttributes.push("show-filter-text");
    }
  }

  document.body.setAttribute(
    "da-filter-placeholders",
    placeholderAttributes.join(" "),
  );
};

const applyFilter = async (filter, filterData = undefined) => {
  if (!filter.styleSheet) {
    const style = document.createElement("style");
    style.setAttribute("da-filter-stylesheet", filter.STORAGE_KEY);
    document.head.appendChild(style);

    filter.styleSheet = style.sheet;
  }

  const enabledPrefix = `body:not([da-filter-disabled~="${filter.STORAGE_KEY}"])`;

  if (!filterData) {
    const data = await browser.storage.local.get({ [filter.STORAGE_KEY]: [] });
    filterData = data[filter.STORAGE_KEY];
  }

  let idx = 0; // TODO: this should start with the count of existing rules in the stylesheet so that new filters have their rules appended after the existing ones
  filter
    .getSelectorsForSharedFilterStyles(filterData)
    // TODO: all of this CSS is now duplicated here AND in content.css (for the "hide untagged submission" rules)... CSS should all be handled in one location
    .forEach((baseSelector) => {
      const selector = `[da-filter-node~="link-wrapper"]:has(${baseSelector})`;

      filter.styleSheet.insertRule(
        `${enabledPrefix} body[da-filter-placeholders~="disabled"] ${selector} {
            display: none !important;
          }`,
        idx++,
      );

      // TODO: clickable placeholders won't work with the new `[da-filter-node~="link-wrapper"]` convention
      // anchor tags are now inside of the element with the placeholder content; we would have to force the anchor tags into a new stacking context so they are "above" the placeholder content, but not show any of the content or styles of those anchor tags...
      filter.styleSheet.insertRule(
        `${enabledPrefix} body[da-filter-placeholders~="prevent-click"] ${selector} {
            pointer-events: none !important;
          }`,
        idx++,
      );

      filter.styleSheet.insertRule(
        `${enabledPrefix} ${selector}::before {
            z-index: var(--da-filter-placeholder-z-index);
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            background-color: var(--da-filter-bg-color);
            color: var(--da-filter-text-color);
            border: 1px solid;
            border-color: var(--da-filter-border-color);
            font-weight: var(--da-filter-font-weight);
            line-height: 1.25em;
            padding: 1.5em;
            text-align: center;
            display: flex;
            flex-direction: column-reverse;
            content: "";
          }`,
        idx++,
      );

      filter.styleSheet.insertRule(
        `${enabledPrefix} ${selector}::after {
            z-index: var(--da-filter-placeholder-z-index);
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            content: "";
            background-color: var(--da-filter-logo-color);
            mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDYuNjQgMjc2LjQ1Ij4NCiAgPHBvbHlnb24gcG9pbnRzPSIzNTcuNDMgMjcyLjI1IDM1Ny40MyAyNzIuMjYgMzY1LjQzIDI3Ni40NSA0NDYuNjQgMjc2LjQ1IDQ0Ni42NCAyNzYuNDIgNDQ2LjY0IDE5NS4yNCA0MzguNDYgMTg3LjEzIDM2NS40NCAxNDguODEgMzU3LjMxIDEzNi43NiAzNTcuMzEgMCAyNDUuNzggMCAyNDUuNzggNzUuMTkgMjM3LjY4IDgxLjg5IDg5LjIxIDQuMiA4OS4yMSA0LjE5IDgxLjIxIDAgMCAwIDAgMC4wMyAwIDgxLjIxIDguMTcgODkuMzEgODEuMiAxMjcuNjQgODkuMzMgMTM5LjY5IDg5LjMzIDI3Ni40NSAyMDAuODUgMjc2LjQ1IDIwMC44NSAyMDEuMjYgMjA5LjAxIDE5NC41NyAzNTcuNDMgMjcyLjI1IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIxLjAiLz4NCjwvc3ZnPg0K");
            mask-position: center center;
            mask-repeat: no-repeat;
            mask-size: 80% 50%;
            -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDYuNjQgMjc2LjQ1Ij4NCiAgPHBvbHlnb24gcG9pbnRzPSIzNTcuNDMgMjcyLjI1IDM1Ny40MyAyNzIuMjYgMzY1LjQzIDI3Ni40NSA0NDYuNjQgMjc2LjQ1IDQ0Ni42NCAyNzYuNDIgNDQ2LjY0IDE5NS4yNCA0MzguNDYgMTg3LjEzIDM2NS40NCAxNDguODEgMzU3LjMxIDEzNi43NiAzNTcuMzEgMCAyNDUuNzggMCAyNDUuNzggNzUuMTkgMjM3LjY4IDgxLjg5IDg5LjIxIDQuMiA4OS4yMSA0LjE5IDgxLjIxIDAgMCAwIDAgMC4wMyAwIDgxLjIxIDguMTcgODkuMzEgODEuMiAxMjcuNjQgODkuMzMgMTM5LjY5IDg5LjMzIDI3Ni40NSAyMDAuODUgMjc2LjQ1IDIwMC44NSAyMDEuMjYgMjA5LjAxIDE5NC41NyAzNTcuNDMgMjcyLjI1IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIxLjAiLz4NCjwvc3ZnPg0K");
            -webkit-mask-position: center center;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: 80% 50%;
          }`,
        idx++,
      );
    });

  filter
    .getSelectorsAndStylesForPlaceholderText(filterData)
    .forEach(([baseSelector, styles]) => {
      const selector = `[da-filter-node~="link-wrapper"]:has(${baseSelector})`;
      filter.styleSheet.insertRule(
        `${enabledPrefix}[da-filter-placeholders~="show-filter-text"] ${selector}::before { ${styles.join(";\n")}; }`,
        idx++,
      );
    });
};

/**
 * Run once the content script is loaded
 */
(async () => {
  // create the filter frame first so it responds to messages
  initFilterFrame();

  pageIsEnabled = !(await isPageDisabled(window.location));

  const enabledFilters = await GetEnabledFilters();
  for (const F of FILTERS) {
    if (!enabledFilters.includes(F.STORAGE_KEY)) {
      setFilterDisabledAttribute(F.STORAGE_KEY);
    }

    applyFilter(F);
  }

  // setup message handlers as soon as we are ready to receive them
  if (!browser.runtime.onMessage.hasListener(onRuntimeMessage)) {
    browser.runtime.onMessage.addListener(onRuntimeMessage);
  }

  if (pageIsEnabled) {
    const options = await GetOptions();

    metadataEnabled = options.metadata.enabled !== false;

    applyAttributesForOptions(options);

    // setup observers for nodes loaded after initial render next
    watchForNewNodes(SELECTORS.join(", "));

    // get all existing nodes on the page and work with them
    handleDeviationLinks(document.querySelectorAll(SELECTORS.join(", ")));
  }
})();
