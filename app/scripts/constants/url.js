export const WILDCARD = "*://*.deviantart.com/*";
export const REGEX =
  /^https?:\/\/(?:(\S+)\.)?deviantart\.com\/([^\?]*)(?:\?(.*))?/i;

/**
 * Configuration for pages where the extension can be disabled.
 *
 * Each top-level property corresponds to a key in the `options.pages` object,
 * which is stored in local browser/extension storage.
 *
 * The properties for each page correspond to parts of a URL object. All parts are an array of RegEx's.
 *
 * At least one RegEx must match from all parts.
 */
export const PAGES = {
  DailyDeviations: {
    pathname: ["^/daily-deviations"],
  },
  Forums: {
    hostname: ["forum.deviantart.com"],
  },
  Notifications: {
    pathname: ["^/notifications"],
  },
};

export const TAG_URL_REGEX = /\/tag\/(?<tag>[^\/]+)\/?/i;
export const SUBMISSION_URL_REGEX =
  /\/(?<username>[^\/]+)\/(?<type>(?:art|journal|status-update))\/(?<id>[^\/]+)\/?/i;
