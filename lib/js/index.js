/**
 * Run deviantART Filter as soon as everything is loaded
 */
(function () {
    var filters = [
        new UsersFilter()
    ];
    var daFilter = new deviantARTFilter(filters);
    daFilter.run();
})();
