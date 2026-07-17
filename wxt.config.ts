import { defineConfig } from "wxt";

const iconPaths = {
  "16": "images/icon-16.png",
  "19": "images/icon-19.png",
  "24": "images/icon-24.png",
  "32": "images/icon-32.png",
  "38": "images/icon-38.png",
  "48": "images/icon-48.png",
  "64": "images/icon-64.png",
  "96": "images/icon-96.png",
  "128": "images/icon-128.png",
};

export default defineConfig({
  srcDir: "app",
  modules: ["@wxt-dev/module-react", "@wxt-dev/webextension-polyfill"],
  manifest: ({ browser, manifestVersion }) => ({
    name: "__MSG_ExtensionName__",
    short_name: "__MSG_ExtensionShortName__",
    description: "__MSG_ExtensionDescription__",
    default_locale: "en",
    homepage_url: "https://rthaut.github.io/deviantART-Filter",
    icons: iconPaths,
    // MV3 has no page_action; the action button is emulated as a page action
    // at runtime (disabled globally, enabled per-tab on deviantart.com)
    [manifestVersion === 3 ? "action" : "page_action"]: {
      default_icon: iconPaths,
      default_title: "__MSG_BrowserActionTitle__",
    },
    permissions: [
      "activeTab",
      "contextMenus",
      "notifications",
      "storage",
      "tabs",
      // MV3 moves host match patterns into host_permissions
      ...(manifestVersion === 3 ? [] : ["*://*.deviantart.com/*"]),
    ],
    ...(manifestVersion === 3
      ? { host_permissions: ["*://*.deviantart.com/*"] }
      : {}),
    web_accessible_resources:
      manifestVersion === 3
        ? [
            {
              resources: ["create-filters.html"],
              matches: ["*://*.deviantart.com/*"],
            },
          ]
        : ["create-filters.html"],
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "{a2ce7c11-e47d-42cf-b6db-ede36265cf6c}",
              strict_min_version: "62.0",
              data_collection_permissions: {
                required: ["none"],
              },
            },
          },
        }
      : {
          // MV3 requires Chrome 88+ (Edge 88+ is the matching Chromium)
          minimum_chrome_version:
            manifestVersion === 3
              ? "88.0"
              : browser === "edge"
                ? "79.0"
                : "49.0",
        }),
  }),
  vite: () => ({
    resolve: {
      alias: {
        scripts: "/app/scripts",
      },
    },
  }),
});
