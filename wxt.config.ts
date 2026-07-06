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
  manifest: ({ browser }) => ({
    name: "__MSG_ExtensionName__",
    short_name: "__MSG_ExtensionShortName__",
    description: "__MSG_ExtensionDescription__",
    default_locale: "en",
    homepage_url: "https://rthaut.github.io/deviantART-Filter",
    icons: iconPaths,
    page_action: {
      default_icon: iconPaths,
      default_title: "__MSG_BrowserActionTitle__",
    },
    permissions: [
      "*://*.deviantart.com/*",
      "activeTab",
      "contextMenus",
      "notifications",
      "storage",
      "tabs",
    ],
    web_accessible_resources: ["create-filters.html"],
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
          minimum_chrome_version: browser === "edge" ? "79.0" : "49.0",
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
