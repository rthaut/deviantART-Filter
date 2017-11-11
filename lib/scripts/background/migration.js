import Filters from './filters';

const Migration = (() => {

    const Migration = {

        /**
         *
         * @param {string} id
         * @param {object[]} items
         */
        'migrateFilter': function (id, items) {
            console.log('[Background] Migration.migrateFilter()', id, items);

            return Filters.importFilterData(id, items).then((results) => {
                console.log('[Background] Migration.migrateFilter() :: Results', results);
                let color, message;

                if (results.error) {
                    color = 'red';
                    message = browser.i18n.getMessage('FilterMigrationFailure', [results.error]);
                } else {
                    color = 'green';
                    message = browser.i18n.getMessage('FilterMigrationSuccess', [results.success, results.total, results.duplicate, results.invalid]);
                }

                return browser.notifications.create({
                    'type': 'basic',
                    'iconUrl': browser.runtime.getURL(`images/logo/logo-${color}.svg`),
                    'title': browser.i18n.getMessage('FilterMigrationComplete'),
                    'message': message
                }).then(() => {
                    return results;
                });
            });
        }

    };

    return Migration;

})();

export default Migration;
