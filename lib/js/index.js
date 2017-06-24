/* global deviantARTFilter, UsersFilter */

/**
 * Run deviantART Filter as soon as everything is loaded
 */
console.info('Script loaded', new Date().toISOString());
(function () {
    console.info('Script started', new Date().toISOString());

    var filters = [
        new UsersFilter()
    ];
    var daFilter = new deviantARTFilter(filters);
    daFilter.run();

    console.info('Script finished', new Date().toISOString());
})();
