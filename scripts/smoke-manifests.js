const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredPermissions = [
  "*://*.deviantart.com/*",
  "activeTab",
  "contextMenus",
  "notifications",
  "storage",
  "tabs",
];

const targets = {
  chrome: {
    directory: "chrome-mv2",
    extraChecks(manifest) {
      assert(
        manifest.minimum_chrome_version === "49.0",
        "Chrome minimum version should be preserved",
      );
    },
  },
  edge: {
    directory: "edge-mv2",
    extraChecks(manifest) {
      assert(
        manifest.minimum_chrome_version === "79.0",
        "Edge minimum version should be preserved",
      );
    },
  },
  firefox: {
    directory: "firefox-mv2",
    extraChecks(manifest) {
      assert(
        manifest.browser_specific_settings?.gecko?.id ===
          "{a2ce7c11-e47d-42cf-b6db-ede36265cf6c}",
        "Firefox extension ID should be preserved",
      );
      assert(
        manifest.browser_specific_settings?.gecko?.strict_min_version ===
          "62.0",
        "Firefox minimum version should be preserved",
      );
      const requiredDataCollection =
        manifest.browser_specific_settings?.gecko?.data_collection_permissions
          ?.required;
      assert(
        requiredDataCollection?.length === 1 &&
          requiredDataCollection[0] === "none",
        "Firefox data collection classification should be none",
      );
    },
  },
};

for (const [browser, { directory, extraChecks }] of Object.entries(targets)) {
  const outputDir = path.join(root, ".output", directory);
  const manifestPath = path.join(outputDir, "manifest.json");
  const manifest = readJson(manifestPath);

  assert(manifest.manifest_version === 2, `${browser} should remain MV2`);
  assert(manifest.default_locale === "en", `${browser} locale should exist`);
  assert(manifest.background?.scripts?.length, `${browser} needs background`);
  assert(manifest.page_action, `${browser} should use page_action`);
  assert(!manifest.action, `${browser} should not use MV3 action`);
  assert(!manifest.browser_action, `${browser} should not use browser_action`);

  for (const permission of requiredPermissions) {
    assert(
      manifest.permissions.includes(permission),
      `${browser} missing permission: ${permission}`,
    );
  }

  const contentScript = manifest.content_scripts?.[0];
  assert(contentScript, `${browser} needs a content script`);
  assert(
    contentScript.matches?.includes("*://*.deviantart.com/*"),
    `${browser} content script should match DeviantArt`,
  );
  assert(
    contentScript.all_frames === false,
    `${browser} content script should stay out of child frames`,
  );
  assert(
    contentScript.run_at === "document_end",
    `${browser} content script run_at should be document_end`,
  );
  assert(contentScript.js?.length, `${browser} content script JS missing`);
  assert(contentScript.css?.length, `${browser} content script CSS missing`);

  assert(
    manifest.web_accessible_resources?.includes("create-filters.html"),
    `${browser} create-filters page should be web accessible`,
  );

  for (const file of [
    "manage.html",
    "create-filters.html",
    "_locales/en/messages.json",
    "images/icon-128.png",
  ]) {
    assert(
      fs.existsSync(path.join(outputDir, file)),
      `${browser} missing output file: ${file}`,
    );
  }

  extraChecks(manifest);
  console.log(`Validated ${browser} manifest`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
