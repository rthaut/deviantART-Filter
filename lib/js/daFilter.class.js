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

        console.log('Adding overhead menu item.');

        var menuItem = $('<a/>')
            .html('Manage Filters')
            .addClass('oh-l')
            .on('click', $.proxy(this.manage, this));

        var menuCell = $('<td>')
            .addClass('oh-hasbutton oh-hashover oh-keep')
            .attr('id', 'oh-menu-filters')
            .append(menuItem);

        $('#oh-menu-deviant', '#overhead').after(menuCell);

        console.log('Overhead menu item added.');

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Change event handler for UI controls for configurable settings
     * @param {Event} event
     */
    toggleSettingChangeEventHandler(event) {
        console.group('deviantARTFilter.toggleSettingChangeEventHandler()');

        var target = $(event.target);
        var setting = target.attr('name');

        console.log('Toggling setting "' + setting + '".');

        switch (setting) {
            case 'placeholders':
                this.usePlaceholders = !this.usePlaceholders;
                $('body').toggleClass('no-placeholders');
                $('body').toggleClass('placeholders');
                break;
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Click event handler for the Export Filters button
     * @param {Event} event
     */
    exportFiltersClickEventHandler(event) {
        console.group('deviantARTFilter.exportFiltersClickEventHandler()');

        event.preventDefault();

        var filterData = this.exportFilters();
        $('#filtersTextBox').val(JSON.stringify(filterData));

        $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Click event handler for the Import Filters button
     * @param {Event} event
     */
    importFiltersClickEventHandler(event) {
        console.group('deviantARTFilter.importFiltersClickEventHandler()');

        event.preventDefault();

        if ($('#filtersTextBox').val().length > 0) {
            try {
                this.importFilters(JSON.parse($('#filtersTextBox').val()));
            } catch (ex) {
                console.error(ex);
                daDialog.alert('Unable to parse filters from JSON: ', ex.toString());
            }
        } else {
            daDialog.alert('Nothing to import.');
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Change event handler for the Import/Export Filters textarea
     * @param {Event} event
     */
    importExportFilterChangeEventHandler(event) {
        console.group('deviantARTFilter.importExportFilterChangeEventHandler()');

        if ($('#filtersTextBox').val().length > 0) {
            console.log('Textarea has content; only allowing import');
            $('#exportFiltersButton').prop('disabled', true).addClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', false).removeClass('disabledbutton');
        } else {
            console.log('Textarea has no content; only allowing export');
            $('#exportFiltersButton').prop('disabled', false).removeClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Builds and displays the management/settings modal
     * @param {Event} event
     */
    manage(event) {
        console.group('deviantARTFilter.manage()');

        var content = $('<div/>')

        var tabs = $('<div>')
            .addClass('manage-filters-tabs')
            .appendTo(content);

        if (this.filters.length) {
            for (var i = 0; i < this.filters.length; i++) {
                var listTab = $('<a/>')
                    .addClass('manage-filters-tab')
                    .addClass('active')
                    .attr('data-tab', 'manage-' + this.filters[i].label.toLowerCase() + '-tab-content')
                    .html('Filtered ' + this.filters[i].label)
                    .appendTo(tabs);
            }
        }

        var settingsTab = $('<a/>')
            .addClass('manage-filters-tab')
            .attr('data-tab', 'manage-settings-tab-content')
            .html('Settings')
            .appendTo(tabs);

        if (this.filters.length) {
            for (var i = 0; i < this.filters.length; i++) {
                var listContent = $('<div/>')
                    .addClass('manage-filters-tab-content')
                    .attr('id', 'manage-' + this.filters[i].label.toLowerCase() + '-tab-content')
                    .appendTo(content);

                var listTable = this.filters[i].getTable()
                    .appendTo(listContent);
            }
        }

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


        if (this.filters.length) {
            for (var i = 0; i < this.filters.length; i++) {
                var cleanListButton = $('<button/>')
                    .addClass('smbutton smbutton-size-default smbutton-shadow')
                    .html('Clean Hidden ' + this.filters[i].label)
                    .on('click', $.proxy(this.filters[i].cleanFilterListClickEventHandler, this.filters[i]))
                    .appendTo(cleanFiltersFieldset);
            }

            var separator = $('<span/>')
                .html('&nbsp;&nbsp;&nbsp;')
                .appendTo(cleanFiltersFieldset);

            for (var i = 0; i < this.filters.length; i++) {
                var emptyListButton = $('<button/>')
                    .addClass('smbutton smbutton-size-default smbutton-red smbutton-shadow')
                    .html('Reset Hidden ' + this.filters[i].label)
                    .on('click', $.proxy(this.filters[i].resetFilterListClickEventHandler, this.filters[i]))
                    .appendTo(cleanFiltersFieldset);
            }
        }

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

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Runs the primary logic
     */
    run() {
        console.group('deviantARTFilter.run()');

        $('body').addClass(this.usePlaceholders ? 'placeholders' : 'no-placeholders');

        if (this.filters.length) {
            for (var i = 0; i < this.filters.length; i++) {
                this.filters[i].hideAll();
                this.filters[i].insertDOMControls();
            }
        }

        this.addControls();

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Exports filters to object for import
     * @returns {Object}
     */
    exportFilters() {
        console.group('deviantARTFilter.exportFilters()');

        var filterData = {};

        if (this.filters.length) {
            var listName;
            for (var i = 0; i < this.filters.length; i++) {
                listName = this.filters[i].label.toLowerCase();
                filterData[listName] = this.filters[i].list.data;
            }
        }

        console.log('Return', filterData);
        console.log('Complete');
        console.groupEnd();

        return filterData;
    }

    /**
     * Imports filters from exported filters object
     * @param {Object} filterData
     */
    //@TODO the tables need to be refreshed after import
    importFilters(filterData) {
        console.group('deviantARTFilter.importFilters()');

        console.log('filterData', filterData);

        var results = {};
        var message = "Results:\n";

        var listName, filterObjects, filterObject;
        for (var i = 0; i < this.filters.length; i++) {
            listName = this.filters[i].label.toLowerCase();
            if (typeof filterData[listName] !== 'undefined') {
                filterObjects = filterData[listName];
                results = { Total: 0, Success: 0, Existing: 0, Invalid: 0 };
                results.Total = filterObjects.length;
                console.log('Hiding ' + listName, filterObjects);
                for (var j = 0; j < filterObjects.length; j++) {
                    filterObject = this.filters[i].create(filterObjects[j]);
                    if (!filterObject.isValid()) {
                        results.Invalid++;
                    } else if (this.filters[i].isHidden(filterObject)) {
                        results.Existing++;
                    } else if (this.filters[i].hide(filterObject)) {
                        results.Success++;
                    }
                }
            }

            this.filters[i].list.save();

            message += "\n" + listName.capitalize() + "\n";
            for (var prop in results) {
                if (results.hasOwnProperty(prop)) {
                    message += "- " + prop + ": " + results[prop] + "\n";
                }
            }
            message += "\n";
        }

        daDialog.alert(message, "Import Finished Successfully");

        console.log('Complete');
        console.groupEnd();
    }
}
