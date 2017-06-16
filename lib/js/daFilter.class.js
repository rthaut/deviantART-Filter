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
        console.group('deviantARTFilter.addControls()');

        var menuItem = $('<a/>')
            .html('Manage Filters')
            .addClass('oh-l')
            .on('click', $.proxy(this.manage, this));

        var menuCell = $('<td>')
            .addClass('oh-hasbutton oh-hashover oh-keep')
            .attr('id', 'oh-menu-filters')
            .append(menuItem);

        $('#oh-menu-deviant', '#overhead').after(menuCell);

        console.log('deviantARTFilter.addControls() :: Complete');
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
                .html('Filtered ' + filter.label)
                .appendTo(tabs);
        });

        var settingsTab = $('<a/>')
            .addClass('manage-filters-tab')
            .attr('data-tab', 'manage-settings-tab-content')
            .html('Settings')
            .appendTo(tabs);

        this.filters.forEach(function (filter) {
            var listContent = $('<div/>')
                .addClass('manage-filters-tab-content')
                .attr('id', 'manage-' + filter.label.toLowerCase() + '-tab-content')
                .appendTo(content);

            var listTable = filter.getTable()
                .appendTo(listContent);
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

        var basicSettingsLegend = $('<legend/>')
            .html('Basic Settings')
            .appendTo(basicSettingsFieldset);

        var placeholdersWrapper = $('<p/>')
            .appendTo(basicSettingsFieldset);

        var placeholdersInput = $('<input/>')
            .attr('type', 'checkbox')
            .attr('id', 'placeholders')
            .attr('name', 'placeholders')
            .attr('checked', this.usePlaceholders)
            .on('change', $.proxy(this.toggleSettingChangeEventHandler, this))
            .appendTo(placeholdersWrapper);

        var placeholdersLabel = $('<label/>')
            .attr('for', 'placeholders')
            .html(' Use placeholders for hidden deviations')
            .append('<br/><small>(Disabling this will hide deviations completely)</small>')
            .appendTo(placeholdersWrapper);

        var cleanFiltersFieldset = $('<fieldset/>')
            .addClass('clean-filters-fieldset')
            .appendTo(settingsForm);

        var cleanFiltersLegend = $('<legend/>')
            .html('Clean Old/Broken Filters')
            .appendTo(cleanFiltersFieldset);


        this.filters.forEach(function (filter) {
            var cleanListButton = $('<button/>')
                .addClass('smbutton smbutton-size-default smbutton-shadow')
                .html('Clean Hidden ' + filter.label)
                .on('click', $.proxy(filter.cleanFilterListClickEventHandler, filter))
                .appendTo(cleanFiltersFieldset);
        });

        var separator = $('<span/>')
            .html('&nbsp;&nbsp;&nbsp;')
            .appendTo(cleanFiltersFieldset);

        this.filters.forEach(function (filter) {
            var emptyListButton = $('<button/>')
                .addClass('smbutton smbutton-size-default smbutton-red smbutton-shadow')
                .html('Reset Hidden ' + filter.label)
                .on('click', $.proxy(filter.resetFilterListClickEventHandler, filter))
                .appendTo(cleanFiltersFieldset);
        });

        var importExportFieldset = $('<fieldset/>')
            .addClass('import-export-fieldset')
            .appendTo(settingsForm);

        var importExportLegend = $('<legend/>')
            .html('Export/Import Filters')
            .appendTo(importExportFieldset);

        var importExportHint = $('<span/>')
            .attr('id', 'importExportHint')
            .html('<b>Instructions</b>:<br/>- Click the "Export Filters" button to output your filters into JSON in the text box below.<br/>- Click the "Import Filters" button to load filters from the JSON in the text box below.<br/>')
            .appendTo(importExportFieldset);

        var exportButton = $('<button/>')
            .addClass('smbutton smbutton-size-default smbutton-blue smbutton-shadow')
            .attr('id', 'exportFiltersButton')
            .html('Export Filters')
            .on('click', $.proxy(this.exportFiltersClickEventHandler, this))
            .appendTo(importExportFieldset);

        var separator2 = $('<span/>')
            .html('&nbsp;&nbsp;&nbsp;')
            .appendTo(importExportFieldset);

        var importButton = $('<button/>')
            .addClass('smbutton smbutton-size-default smbutton-blue smbutton-shadow disabledbutton')
            .attr('id', 'importFiltersButton')
            .prop('disabled', true)
            .html('Import Filters')
            .on('click', $.proxy(this.importFiltersClickEventHandler, this))
            .appendTo(importExportFieldset);

        var importExportTextBox = $('<textarea>')
            .attr('id', 'filtersTextBox')
            .on('change keyup paste', $.proxy(this.importExportFilterChangeEventHandler, this))
            .appendTo(importExportFieldset);

        content.daModal({ title: 'Manage deviantART Filters', width: '75%', height: '75%', footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" script by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>' });

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
    //@TODO the tables need to be refreshed after import
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
