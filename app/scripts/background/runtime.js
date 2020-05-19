import semverClean from 'semver/functions/clean';
import semverLT from 'semver/functions/lt';

import { GetCategories } from './categories';
import { ImportFilters } from './filters';

import { TAG_FILTERS_MIGRATED } from '../constants/notifications';

export const OnInstalled = ({ previousVersion, reason, temporary }) => {

    // fetch and store the latest category paths
    GetCategories();

    if (temporary) {
        // use this to simulate installs/updates for testing purposes
        // previousVersion = '6.0.0';
        // reason = 'install';
    }

    switch (reason) {
        case 'install':
            ShowInstalledPage();
            break;

        case 'update':
            OnUpdated(previousVersion);
            break;
    }
};

const OnUpdated = async (previousVersion) => {
    let { 'version': currentVersion } = await browser.management.getSelf();

    currentVersion = semverClean(currentVersion);
    previousVersion = semverClean(previousVersion);

    if (previousVersion !== null) {
        if (semverLT(previousVersion, '6.0.0')) {
            await MigrateTagFiltersToKeywordFilters();
        }
    }

    await ShowUpdatedPage(currentVersion, previousVersion);
};

const MigrateTagFiltersToKeywordFilters = async () => {
    const data = await browser.storage.local.get('tags');
    if (data?.tags) {
        console.warn('Migrating tag filters to keyword filters');
        await ImportFilters(data);

        // TODO: is it appropriate to delete tag filters from previous versions?
        // await browser.storage.local.remove('tags');

        browser.notifications.create(TAG_FILTERS_MIGRATED, {
            'type': 'basic',
            'iconUrl': browser.extension.getURL('images/icon-64.png'),
            'title': browser.i18n.getMessage('ExtensionName'),
            'message': browser.i18n.getMessage('TagFiltersMigratedNotificationMessage'),
        });
    }
};

const ShowInstalledPage = async () => {
    const url = 'https://rthaut.github.io/DeviantArt-Filter/installed';
    await browser.tabs.create({ url });
};


const ShowUpdatedPage = async (currentVersion, previousVersion) => {
    const url = `https://rthaut.github.io/DeviantArt-Filter/releases/v${currentVersion}/?from=v${previousVersion}`;
    await browser.tabs.create({ url });
};
