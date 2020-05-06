import semverLT from 'semver/functions/lt';
import semverValid from 'semver/functions/valid';

import { GetCategories } from './categories';
import { ImportFilters } from './filters';

import { TAG_FILTERS_MIGRATED } from '../constants/notifications';

export const OnInstalled = async (details) => {
    const { previousVersion } = details;

    if (semverValid(previousVersion) && semverLT(previousVersion, '6.0.0')) {
        const data = await browser.storage.local.get('tags');
        if (data?.tags) {
            console.warn('Converting tag filters to keyword filters');
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
    }

    // fetch and store the latest category paths
    await GetCategories();
};
