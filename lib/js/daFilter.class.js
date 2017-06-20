/**
 * Primary deviantART Filter Class
 */
class deviantARTFilter {

    /**
     * Constructor
     * @param {Array<Filter>} filters
     */
    constructor(filters) {
        this.filters = filters

        this.usePlaceholders;
    }

    /**
     * Getter for "User Placeholders" Boolean setting
     * @returns {Boolean}
     */
    get usePlaceholders() {
        return getStoredJSON('usePlaceholders', true);
    }

    /**
     * Setter for "User Placeholders" Boolean setting
     * @param {Boolean} value
     */
    set usePlaceholders(value) {
        setStoredJSON('usePlaceholders', value);
    }

    /**
     * Inserts the base deviantART Filter DOM elements
     */
    addControls() {
        console.log('deviantARTFilter.addControls()');

        if (!$('#oh-menu-filters').length) {
            var menuCell = $('<td/>')
                .addClass('oh-hasbutton oh-hashover oh-keep')
                .attr('id', 'oh-menu-filters');

            var menuItem = $('<a/>')
                .text('Manage Filters')
                .addClass('oh-l')
                .on('click', $.proxy(this.manage, this))
                .appendTo(menuCell);

            $('.oh-gap', '#overhead').after(menuCell);
            $('#oh-menu-deviant', '#overhead').after(menuCell);
            console.log('deviantARTFilter.addControls() :: Inserting Menu Item', menuCell);
        }

        console.log('deviantARTFilter.addControls() :: Complete');
    }

    /**
     * Adds listeners for custom events
     */
    addCustomEventListeners() {
        var self = this;

        window.addEventListener('daFilter-list-saved', function (e) {
            self.filters.forEach(function (filter) {
                if (filter.list.listObjectName === e.detail.listObjectName) {
                    self.refreshFilterTable(filter);
                }
            });
        }, false);
    }

    /**
     * Rebuilds the table on the management modal for the supplied filter
     * @param {Filter} filter
     */
    //@TODO should this be a method on the Filter instead?
    refreshFilterTable(filter) {
        var listContent = $('#manage-' + filter.label.toLowerCase() + '-tab-content');
        if (listContent.length) {

            var listTableInfo = $('#filter-data-' + filter.label.toLowerCase() + '-table-info', listContent);
            listTableInfo.html('Current Filtered ' + filter.label + ' Count: <strong>' + filter.list.data.length + '</strong>');

            var listTableLoading = $('#filter-data-' + filter.label.toLowerCase() + '-table-loading', listContent);
            listTableLoading.show();

            var listTable = $('table', listContent);
            listTable.remove();

            setTimeout(function () {
                filter.getTableAsync().then(function (table) {
                    listTableLoading.hide();
                    listContent.append(table);
                });
            }, 50);

        }
    }

    /**
     * Change event handler for UI controls for configurable settings
     * @param {Event} event
     */
    toggleSettingChangeEventHandler(event) {
        console.log('deviantARTFilter.toggleSettingChangeEventHandler()');

        var target = $(event.target);
        var setting = target.attr('name');

        console.log('deviantARTFilter.addControls() :: Toggling setting "' + setting + '"');

        switch (setting) {
            case 'placeholders':
                this.usePlaceholders = !this.usePlaceholders;
                $('body').toggleClass('no-placeholders');
                $('body').toggleClass('placeholders');
                break;
        }

        console.log('deviantARTFilter.toggleSettingChangeEventHandler() :: Complete');
    }

    /**
     * Click event handler for the Export Filters button
     * @param {Event} event
     */
    exportFiltersClickEventHandler(event) {
        console.log('deviantARTFilter.exportFiltersClickEventHandler()');

        event.preventDefault();

        var filterData = this.exportFilters();
        $('#filtersTextBox').val(JSON.stringify(filterData));

        $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');

        console.log('deviantARTFilter.exportFiltersClickEventHandler() :: Complete');
    }

    /**
     * Click event handler for the Import Filters button
     * @param {Event} event
     */
    importFiltersClickEventHandler(event) {
        console.log('deviantARTFilter.importFiltersClickEventHandler()');

        event.preventDefault();

        if ($('#filtersTextBox').val().length == 0) {
            daDialog.alert('Nothing to import.');
            console.log('deviantARTFilter.importFiltersClickEventHandler() :: Nothing to import');
            return;
        }

        var filterData;
        try {
            filterData = JSON.parse($('#filtersTextBox').val());
        } catch (error) {
            console.error(error);
            daDialog.alert('Unable to parse filters from JSON: ' + error.toString(), 'Import Failed');
            return;
        }

        var dialog = daDialog.modal('Your filters are currently being imported. You will be notified when the import is compete.', 'Importing Filters');

        var self = this;
        setTimeout(function () {
            self.importFilters(filterData).then(function (results) {
                //@TODO the tables need to be refreshed after import
                var message = self.importResultsToMessage(results);
                dialog.close();
                daDialog.alert(message, 'Import Finished Successfully');
            });
        }, 100);

        console.log('deviantARTFilter.importFiltersClickEventHandler() :: Complete');
    }

    /**
     * Change event handler for the Import/Export Filters textarea
     * @param {Event} event
     */
    importExportFilterChangeEventHandler(event) {
        console.log('deviantARTFilter.importExportFilterChangeEventHandler()');

        if ($('#filtersTextBox').val().length > 0) {
            $('#exportFiltersButton').prop('disabled', true).addClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', false).removeClass('disabledbutton');
        } else {
            $('#exportFiltersButton').prop('disabled', false).removeClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');
        }

        console.log('deviantARTFilter.importExportFilterChangeEventHandler() :: Complete');
    }

    /**
     * Builds and displays the management/settings modal
     * @param {Event} event
     */
    manage(event) {
        console.log('deviantARTFilter.manage()');

        var content = $('<div/>')

        var tabs = $('<div>')
            .addClass('manage-filters-tabs')
            .appendTo(content);

        this.filters.forEach(function (filter) {
            var listTab = $('<a/>')
                .addClass('manage-filters-tab')
                .addClass('active')
                .attr('data-tab', 'manage-' + filter.label.toLowerCase() + '-tab-content')
                .text('Filtered ' + filter.label)
                .appendTo(tabs);
        });

        var settingsTab = $('<a/>')
            .addClass('manage-filters-tab')
            .attr('data-tab', 'manage-settings-tab-content')
            .text('Settings')
            .appendTo(tabs);

        this.filters.forEach(function (filter) {
            var listContent = $('<div/>')
                .addClass('manage-filters-tab-content')
                .attr('id', 'manage-' + filter.label.toLowerCase() + '-tab-content')
                .appendTo(content);

            var listTableInfo = $('<p/>')
                .addClass('filter-data-table-info')
                .attr('id', 'filter-data-' + filter.label.toLowerCase() + '-table-info')
                .html('Current Filtered ' + filter.label + ' Count: <strong>' + filter.list.data.length + '</strong>')
                .appendTo(listContent);

            var listTableLoading = $('<p/>')
                .addClass('filter-data-table-loading')
                .attr('id', 'filter-data-' + filter.label.toLowerCase() + '-table-loading')
                .text('Loading filtered ' + filter.label.toLowerCase() + ' data...')
                .appendTo(listContent);

            setTimeout(function () {
                filter.getTableAsync().then(function (table) {
                    table.attr('id', 'filter-data-' + filter.label.toLowerCase() + '-table');
                    listTableLoading.hide();
                    listContent.append(table);
                });
            }, 50);
        });

        var settingsContent = $('<div/>')
            .addClass('manage-filters-tab-content')
            .attr('id', 'manage-settings-tab-content')
            .addClass('hidden')
            .appendTo(content);

        var settingsForm = $('<form/>')
            .addClass('manage-filters-settings').
            appendTo(settingsContent);

        var basicSettingsFieldset = $('<fieldset/>')
            .addClass('basic-settings-fieldset')
            .appendTo(settingsForm);

        $('<legend/>').text('Basic Settings').appendTo(basicSettingsFieldset);

        var placeholdersWrapper = $('<p/>')
            .appendTo(basicSettingsFieldset);

        $('<input/>').attr('type', 'checkbox')
            .attr('id', 'placeholders')
            .attr('name', 'placeholders')
            .attr('checked', this.usePlaceholders)
            .on('change', $.proxy(this.toggleSettingChangeEventHandler, this))
            .appendTo(placeholdersWrapper);

        $('<label/>').text(' Use placeholders for filtered deviations')
            .attr('for', 'placeholders')
            .append('<br/><small>(Disabling this will hide deviations completely)</small>')
            .appendTo(placeholdersWrapper);

        var manageFiltersFieldset = $('<fieldset/>')
            .addClass('manage-filters-fieldset')
            .appendTo(settingsForm);

        $('<legend/>').text('Filter Management').appendTo(manageFiltersFieldset);

        $('<p/>')
            .html('<strong>Warning</strong>: These are primarily for troubleshooting purposes and should be used with caution.')
            .appendTo(manageFiltersFieldset);

        var manageFiltersTable = $('<table/>')
            .addClass('manage-filters-table')
            .appendTo(manageFiltersFieldset);

        this.filters.forEach(function (filter) {
            var manageFiltersRow = $('<tr/>').appendTo(manageFiltersTable);

            $('<label/>').text('Filtered ' + filter.label + ':').appendTo(manageFiltersRow).wrap('<td/>');

            $('<button/>').text('Clean Filters')
                .addClass('smbutton smbutton-size-default smbutton-shadow')
                .on('click', $.proxy(filter.cleanFilterListClickEventHandler, filter))
                .appendTo(manageFiltersRow)
                .wrap('<td/>');

            $('<button/>').text('Reset Filters')
                .addClass('smbutton smbutton-size-default smbutton-red smbutton-shadow')
                .on('click', $.proxy(filter.resetFilterListClickEventHandler, filter))
                .appendTo(manageFiltersRow)
                .wrap('<td/>');
        });

        var importExportFieldset = $('<fieldset/>')
            .addClass('import-export-fieldset')
            .appendTo(settingsForm);

        $('<legend/>').text('Export/Import Filters').appendTo(importExportFieldset);

        $('<span/>').attr('id', 'importExportHint')
            .html('<b>Instructions</b>:<br/>- Click the "Export Filters" button to output your filters into JSON in the text box below.<br/>- Click the "Import Filters" button to load filters from the JSON in the text box below.<br/>')
            .appendTo(importExportFieldset);

        $('<button/>').text('Export Filters')
            .addClass('smbutton smbutton-size-default smbutton-blue smbutton-shadow')
            .attr('id', 'exportFiltersButton')
            .on('click', $.proxy(this.exportFiltersClickEventHandler, this))
            .appendTo(importExportFieldset);

        $('<span/>').html('&nbsp;&nbsp;&nbsp;').appendTo(importExportFieldset);

        $('<button/>').text('Import Filters')
            .addClass('smbutton smbutton-size-default smbutton-blue smbutton-shadow disabledbutton')
            .attr('id', 'importFiltersButton')
            .prop('disabled', true)
            .on('click', $.proxy(this.importFiltersClickEventHandler, this))
            .appendTo(importExportFieldset);

        $('<textarea>').attr('id', 'filtersTextBox')
            .on('change keyup paste', $.proxy(this.importExportFilterChangeEventHandler, this))
            .appendTo(importExportFieldset);

        content.daModal({ title: 'Manage deviantART Filters', width: '75%', height: '75%', footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>' });

        $('a.manage-filters-tab').on('click', function () {
            var tab = $(this).attr('data-tab');
            $('a.manage-filters-tab').removeClass('active');
            $('div.manage-filters-tab-content').addClass('hidden');
            $(this).addClass('active');
            $('#' + tab).removeClass('hidden');
        });

        console.log('deviantARTFilter.manage() :: Complete');
    }

    /**
     * Runs the primary logic
     */
    run() {
        console.log('deviantARTFilter.run()');

        $('body').addClass(this.usePlaceholders ? 'placeholders' : 'no-placeholders');

        this.filters.forEach(function (filter) {
            filter.hideAll();
            filter.insertDOMControls();
        });

        this.addControls();
        this.addCustomEventListeners();

        console.log('deviantARTFilter.run() :: Complete');
    }

    /**
     * Exports filters to object for import
     * @returns {Object}
     */
    exportFilters() {
        console.log('deviantARTFilter.exportFilters()');

        var filterData = {};
        this.filters.forEach(function (filter) {
            filterData[filter.label.toLowerCase()] = filter.list.data;
        });

        console.log('deviantARTFilter.exportFilters() :: Return', filterData);
        return filterData;
    }

    /**
     * Imports filters from exported filters object asynchronously
     * @param {Object} filterData
     */
    importFilters(filterData) {
        console.log('deviantARTFilter.importFilters()');

        var lists = [];
        var promises = [];

        this.filters.forEach(function (filter) {
            var listName = filter.label.toLowerCase();
            if (typeof filterData[listName] !== 'undefined') {
                lists.push(filter.label);
                promises.push(filter.import(filterData[listName]));
            }
        });

        console.log('deviantARTFilter.importFilters() :: Promises', promises);

        return Promise.all(promises).then(function (results) {
            console.log('deviantARTFilter.importFiltersAsync() :: Results', results);

            var ret = [];
            for (var i = 0; i < results.length; i++) {
                ret.push({
                    'label': lists[i],
                    'data': results[i]
                });
            }

            console.log('deviantARTFilter.importFilters() :: Return', ret);
            return ret;
        });
    }

    /**
     * Generates a string representation of the import filter results
     * @param {Object} results
     */
    //@TODO generate HTML instead for better styling?
    importResultsToMessage(results) {
        console.log('deviantARTFilter.importResultsToMessage()');

        var message = '';
        results.forEach(function (result) {
            message += 'Imported ' + result.label + "\n";
            for (var prop in result.data) {
                if (result.data.hasOwnProperty(prop)) {
                    message += '- ' + prop.capitalize() + ': ' + result.data[prop] + "\n";
                }
            }
        });

        console.log('deviantARTFilter.importResultsToMessage() :: Return', message);
        return message;
    }
}
