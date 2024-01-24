import semverClean from "semver/functions/clean";
import semverDiff from "semver/functions/diff";
import semverLT from "semver/functions/lt";

import { ImportFilters } from "../filters";

import { TAG_FILTERS_MIGRATED } from "../constants/notifications";

export const OnInstalled = ({ previousVersion, reason, temporary }) => {
  if (temporary) {
    // use this to simulate installs/updates for testing purposes
    // previousVersion = '6.1.0';
    // reason = 'install';
  }

  switch (reason) {
    case "install":
      ShowInstalledPage();
      break;

    case "update":
      OnUpdated(previousVersion);
      break;
  }
};

const OnUpdated = async (previousVersion) => {
  let { version: currentVersion } = await browser.management.getSelf();

  currentVersion = semverClean(currentVersion);
  previousVersion = semverClean(previousVersion);

  if (previousVersion !== null) {
    if (semverLT(previousVersion, "6.0.0")) {
      await MigrateTagFiltersToKeywordFilters();
    }
  }

  let showUpdatedPageToUser = false;
  try {
    const releaseType = semverDiff(currentVersion, previousVersion);
    if (releaseType !== null) {
      const releaseTypes = await GetReleaseTypesFromOptions();
      showUpdatedPageToUser = releaseTypes.includes(releaseType);
    }
  } catch (error) {
    console.error("Failed to determine version difference on upgrade", error);
  }

  if (showUpdatedPageToUser) {
    await ShowUpdatedPage(currentVersion, previousVersion);
  }
};

const GetReleaseTypesFromOptions = async () => {
  const { options } = await browser.storage.local.get("options");
  const releaseType = options?.showUpdatedPageOnUpdate ?? "patch";
  const releaseTypes = [];

  switch (releaseType /* eslint-disable no-fallthrough */) {
    case "patch":
      releaseTypes.push("patch");
    case "minor":
      releaseTypes.push("minor");
    case "major":
      releaseTypes.push("major");
  }

  return releaseTypes;
};

const MigrateTagFiltersToKeywordFilters = async () => {
  const data = await browser.storage.local.get("tags");
  if (data?.tags) {
    console.warn("Migrating tag filters to keyword filters");
    await ImportFilters(data);

    // TODO: is it appropriate to delete tag filters from previous versions?
    // await browser.storage.local.remove('tags');

    browser.notifications.create(TAG_FILTERS_MIGRATED, {
      type: "basic",
      iconUrl: browser.extension.getURL("images/icon-64.png"),
      title: browser.i18n.getMessage("ExtensionName"),
      message: browser.i18n.getMessage("TagFiltersMigratedNotificationMessage"),
    });
  }
};

const ShowInstalledPage = () => {
  return browser.tabs.create({
    url: "https://rthaut.github.io/deviantART-Filter/installed",
    active: true,
  });
};

const ShowUpdatedPage = (currentVersion, previousVersion) => {
  return browser.tabs.create({
    url: `https://rthaut.github.io/deviantART-Filter/releases/v${currentVersion}/?from=v${previousVersion}`,
    active: false,
  });
};
