// ==UserScript==
// @name        deviantART Filter
// @author      Ryan Thaut
// @description Allows automatic filtering of deviations from certain users and/or in certain categories.
// @namespace   http://repo.ryanthaut.com/userscripts/deviantart_filter
// @updateURL   http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter.meta.js
// @downloadURL http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter.user.js
// @include     http://*deviantart.com/*
// @include     https://*deviantart.com/*
// @version     3.0
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @require     http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

"use strict";

const DEBUG = false;

const CORNER_LIGHT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAAAsUlEQVRIic3VPQuCYBSG4bvoA4fAIaKlpcHFoSASGpoaGgJDEMX//0dcEkTMXgPf8zxw7xdnOQCVYAUCiL5OirAcWCnCYj6zhrTLgIUiLKI1a0xTCswVYUc6swZVwAuYKcIOXZQC7NmHUoDtFWGPbyhr2FYRdh9CWcJCRdjtF8oCVgIbRdjVBeUbVgCBIuzsivIJy4G1GiwFdmNQPmAJsByLmhL2ZuBBuyyboAt/XqlZDcPEGXawh1sVAAAAAElFTkSuQmCC";
const CORNER_DARK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAAAvklEQVRIic3OMQ7BcBxH8cdgQiQmu7W7zcQBnMAFXMAFxGoxdHWA3sAB7FaNhbGLSAxq0aRpilbT/+/7krd/AGLBbwgg8l4pwiKgpwhb8s4akv4CtBVhC1JZY5JDoKUIm5PJGhQDR6CpCJtlUQqwA9BQhE3yUNaw/SeUNWykCAu+oaxgT8BThO1+oSxgD2CoCNsWQbmG3YGBImxdFOUSFgF9NdgJGJdBuYD5QKcsqk7YGZj+A0q61vAG6FZBvQCzZyZfoGzu2QAAAABJRU5ErkJggg==";

function addStyleSheet(css = "") {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    return style.sheet;
}

function resetStyleSheet(sheet) {
    while (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
    }
}

class deviantARTFilter {
    constructor() {
        this._filterSheet = null;
        this._filterSheetIDX = -1;
    }

    get hiddenUsers() {
        return JSON.parse(GM_getValue('hiddenUsers', '[]'));
    }

    set hiddenUsers(users) {
        GM_setValue('hiddenUsers', JSON.stringify(users));
    }

    get usePlaceholders() {
        return GM_getValue('usePlaceholders', true);
    }

    set usePlaceholders(val) {
        GM_setValue('usePlaceholders', val);
    }

    addControls() {
        if (DEBUG) console.group('deviantARTFilter.addControls()');

        if (DEBUG) console.log('Adding overhead menu item.');

        var menuItem = $('<a/>')
            .html('Manage Filters')
            .addClass('oh-l')
            .on('click', $.proxy(this.manage, this));

        var menuCell = $('<td>')
            .addClass('oh-hasbutton oh-hashover oh-keep')
            .attr('id', 'oh-menu-filters')
            .append(menuItem);

        $('#oh-menu-deviant', '#overhead').after(menuCell);

        if (DEBUG) console.log('Overhead menu item added.');

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    insertBaseCSS() {
        if (DEBUG) console.group('deviantARTFilter.insertBaseCSS()');

        var css = '';

        css += '#overhead #oh-menu-filters { background: #46584A; border-bottom: 1px solid #38463B; }';
        css += '#overhead #oh-menu-filters a.oh-l { cursor: pointer; height: 49px; line-height: 50px; padding: 0 6px; }';

        css += '.torpedo-container .thumb .hide-user-corner { position: absolute; z-index: 10; top: 0; left: 0; width: 38px; height: 26px; background-image: url(' + CORNER_LIGHT + '); background-position: right; opacity: 0; display: flex; align-items: center; text-indent: 5px; font-family: DA-brandicons; font-size: 16px; font-weight: bold; line-height: 1; color: #EAF2EE; cursor: pointer; transition: all .2s cubic-bezier(0,0,.58,1); white-space: nowrap; }';
        css += '.torpedo-container .thumb .hide-user-corner:hover { background-image: url(' + CORNER_DARK + '); color: #D32800; }';
        css += '.torpedo-container .thumb:hover .hide-user-corner { opacity: 1; }';
        css += '.torpedo-container .thumb .hide-user-corner::after { content: "\\e632"; margin-right: 5px; display: inline; }';

        css += '.manage-filters-settings { padding: 1em; }';
        css += '.manage-filters-settings fieldset { border: 0; padding: 0; margin: 0 0 15px; display: block; margin-bottom: 1em; }';
        css += '.manage-filters-settings label { line-height: 1.5em; vertical-align: top; }';
        css += '.manage-filters-settings label small { color: #3B5A4A; }';

        css += '.manage-filters-tabs { display: block; padding: 0.6em 0; }';
        css += '.manage-filters-tab { background: #DDE6DA; border: 1px solid #92A399; border-radius: 5px 5px 0 0; cursor: pointer; font: 1.333em Trebuchet MS, sans-serif; margin-right: 0.5em; padding: 0.45em 1em; }';
        css += '.manage-filters-tab:hover { text-decoration: none; }';
        css += '.manage-filters-tab.active { background: #E9F0E6; border-bottom: 1px solid #E9F0E6; font-weight: bold; }';

        css += '.manage-filters-tab-content { background: #E9F0E6; border: 1px solid #92A399; margin-bottom: 1em; padding: 0.5em; }';
        css += '.manage-filters-tab-content.hidden { display: none; }';

        css += '.manage-filters-table { border-collapse: collapse; margin: 0 auto; width: 100%; }';
        css += '.manage-filters-table tr { border-bottom: 1px solid rgba(0, 0, 0, 0.15); }';
        css += '.manage-filters-table tr:nth-child(2n) { background-color: rgba(255, 255, 255, 0.35); }';
        css += '.manage-filters-table td { padding: 4px; text-align: left; }';
        css += '.manage-filters-table th { border-bottom: 1px solid #8C9A88; padding: 4px; text-align: left; }';

        css += '.manage-filters-table input { background: transparent; border: 1px solid #92A399; box-shadow: inset 2px 2px 3px 0 rgba(0, 0, 0, 0.1); color: #3B5A4A; padding: 0.2em; width: 75%; }';
        css += '.manage-filters-table input:focus { background: #FFFFFF; }';
        css += '.manage-filters-table button { margin: 0; padding: 0.2em; }';

        css += '.manage-filters-settings fieldset { border: 1px solid #8C9A88; margin-top: 1em; padding: 1em; }';
        css += '.manage-filters-settings fieldset legend { font-weight: bold; padding: 0 1em; }';
        css += '.manage-filters-settings fieldset p { margin: 0 0 1em; }';
        css += '.manage-filters-settings textarea { background-color: rgba(255, 255, 255, 0.35); border: 1px solid #8C9A88; display: block; height: 200px; width: 98%; padding: 1%; margin-top: 1em; resize: vertical; }'

        var sheet = addStyleSheet(css);

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    insertHiddenUsersCSS(users) {
        if (DEBUG) console.group('deviantARTFilter.insertHiddenUsersCSS()');

        var selector = '.torpedo-container .thumb';
        var invisibleCSS = 'display: none !important;';
        var placeholderCSS = 'position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url("http://st.deviantart.net/misc/noentry-green.png") no-repeat center center; display: block; z-index: 10;';

        if (users.length > 0) {
            if (DEBUG) console.log("Hiding user(s):");
            if (this._filterSheet == null) {
                this._filterSheet = addStyleSheet();
            }

            for (var i = 0; i < users.length; i++) {
                if (typeof users[i].username !== 'undefined' && users[i].username !== null) {
                    this._filterSheet.insertRule('body.no-placeholders ' + selector + '[href*="//' + users[i].username + '.deviantart.com"] { ' + invisibleCSS + ' }', 0);
                    this._filterSheet.insertRule('body.placeholders ' + selector + ' a.torpedo-thumb-link[href*="//' + users[i].username + '.deviantart.com"]::before { ' + placeholderCSS + ' }', 0);
                }
            }
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    addEventSubsribers() {
        if (DEBUG) console.group('deviantARTFilter.addEventSubsribers()');

        $('.torpedo-container').on('mouseover', 'span.thumb', function() {
            var regex = /^https?:\/\/([^\.]+)\.deviantart\.com/i;
            var match;

            var thumb = $(this);
            var control = $('span.hide-user-corner', thumb);
            if (!control.length) {
                match = regex.exec(thumb.attr('href'));
                control = $('<span/>').addClass('hide-user-corner');
                control.attr('username', match[1]);
                thumb.find('a.torpedo-thumb-link').append(control);
            }
        });

        $('.torpedo-container').on('click', 'span.hide-user-corner', $.proxy(this.toggleUserDeviationClickHandler, this));

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    hideUserButtonClickHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.hideUserButtonClickHandler()');

        var username = $('input#username').val();

        if (username === '' || username === null) {
            alert('You must provide a Username.');
            return false;
        }

        var user = new User(username);

        if (this.hideUser(user)) {
            $('#manage-users-tab-content').empty().append(this.buildFilteredUsersTable());

            resetStyleSheet(this._filterSheet);
            this.insertHiddenUsersCSS(this.hiddenUsers);
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    unhideUserButtonClickHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.unhideUserButtonClickHandler()');

        var target = $(event.target);
        var user = new User(target.attr('username'));

        if (DEBUG) console.log('Created new User object', user);

        if (this.unhideUser(user)) {
            $('#manage-users-tab-content').empty().append(this.buildFilteredUsersTable());

            resetStyleSheet(this._filterSheet);
            this.insertHiddenUsersCSS(this.hiddenUsers);
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    toggleUserDeviationClickHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.toggleUserDeviationClickHandler()');

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var target = $(event.target);
        var user = new User(target.attr('username'));

        if (DEBUG) console.log('Created new User object', user);

        if (user.isHidden()) {
            this.unhideUser(user);
        } else {
            this.hideUser(user);
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        // nasty nasty nasty
        window.history.back();

        return false;
    }

    hideUser(user) {
        if (DEBUG) console.group('deviantARTFilter.hideUser()');

        var ret = false;

        if (user.hide()) {
            resetStyleSheet(this._filterSheet);
            this.insertHiddenUsersCSS(this.hiddenUsers);
            ret = true;
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return ret;
    }

    unhideUser(user) {
        if (DEBUG) console.group('deviantARTFilter.unhideUser()');

        var ret = false;

        if (user.unhide()) {
            resetStyleSheet(this._filterSheet);
            this.insertHiddenUsersCSS(this.hiddenUsers);
            ret = true;
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return ret;
    }

    toggleSettingChangeEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.toggleSettingChangeEventHandler()');

        var target = $(event.target);
        var setting = target.attr('name');

        if (DEBUG) console.log('Toggling setting "' + setting + '".');

        switch (setting) {
            case 'placeholders':
                this.usePlaceholders = !this.usePlaceholders;
                $('body').toggleClass('no-placeholders');
                $('body').toggleClass('placeholders');
            break;
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    cleanObjectsClickEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.cleanObjectsClickEventHandler()');

        event.preventDefault();

        var target = $(event.target);
        var object = target.attr('name');
        var strict = (target.attr('strict') === 'true');

        if (DEBUG) console.log('Cleaning ' + object + '.');

        var changed = this.cleanHiddenObjects(object, strict);

        if (changed) {
            alert('Your hidden ' + object + ' have been cleaned.');
            resetStyleSheet(this._filterSheet);
            this.insertHiddenUsersCSS(this.hiddenUsers);
        } else {
            alert('Your hidden ' + object + ' are clean; no changes were made.');
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    resetObjectsClickEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.resetObjectsClickEventHandler()');

        event.preventDefault();

        var target = $(event.target);
        var object = target.attr('name');

        if (DEBUG) console.log('Resetting ' + object + '.');

        this.resetHiddenObjects(object);
        alert('Your hidden ' + object + ' have been reset.');

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    exportFiltersClickEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.exportFiltersClickEventHandler()');

        event.preventDefault();

        var filters = this.exportFilters();
        $('#filtersTextBox').val(JSON.stringify(filters));

        $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    importFiltersClickEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.importFiltersClickEventHandler()');

        event.preventDefault();

        if ($('#filtersTextBox').val().length > 0) {
            try {
                this.importFilters(JSON.parse($('#filtersTextBox').val()));
            } catch (ex) {
                alert('Unable to parse filters from JSON.');
            }
        } else {
            alert('Nothing to import.');
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    importExportFilterChangeEventHandler(event) {
        if (DEBUG) console.group('deviantARTFilter.importExportFilterChangeEventHandler()');

        if ($('#filtersTextBox').val().length > 0) {
            if (DEBUG) console.log('Textarea has content; only allowing import');
            $('#exportFiltersButton').prop('disabled', true).addClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', false).removeClass('disabledbutton');
        } else {
            if (DEBUG) console.log('Textarea has no content; only allowing export');
            $('#exportFiltersButton').prop('disabled', false).removeClass('disabledbutton');
            $('#importFiltersButton').prop('disabled', true).addClass('disabledbutton');
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    manage(event) {
        if (DEBUG) console.group('deviantARTFilter.manage()');

        var tabs = $('<div>')
            .addClass('manage-filters-tabs');

        var usersTab = $('<a/>')
            .addClass('manage-filters-tab')
            .addClass('active')
            .attr('data-tab', 'manage-users-tab-content')
            .html('Filtered Users')
            .appendTo(tabs);

        var settingsTab = $('<a/>')
            .addClass('manage-filters-tab')
            .attr('data-tab', 'manage-settings-tab-content')
            .html('Settings')
            .appendTo(tabs);

        var usersContent = $('<div/>')
            .addClass('manage-filters-tab-content')
            .attr('id', 'manage-users-tab-content');

        var usersTable = this.buildFilteredUsersTable()
            .appendTo(usersContent);

        var settingsContent = $('<div/>')
            .addClass('manage-filters-tab-content')
            .attr('id', 'manage-settings-tab-content')
            .addClass('hidden');

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

        var cleanUsersButton = $('<button/>')
            .addClass('smbutton smbutton-size-default smbutton-shadow')
            .html('Clean Hidden Users')
            .attr('name', 'users')
            .attr('strict', false)
            .on('click', $.proxy(this.cleanObjectsClickEventHandler, this))
            .appendTo(cleanFiltersFieldset);

        var separator1 = $('<span/>')
            .html('&nbsp;&nbsp;&nbsp;')
            .appendTo(cleanFiltersFieldset);

        if (DEBUG) {
            var emptyUsersButton = $('<button/>')
                .addClass('smbutton smbutton-size-default smbutton-red smbutton-shadow')
                .html('Reset Hidden Users')
                .attr('name', 'users')
                .on('click', $.proxy(this.resetObjectsClickEventHandler, this))
                .appendTo(cleanFiltersFieldset);
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

        var importExportTextbox = $('<textarea>')
            .attr('id', 'filtersTextBox')
            .on('change keyup paste', $.proxy(this.importExportFilterChangeEventHandler, this))
            .appendTo(importExportFieldset);

        var content = $('<div/>')
            .append(tabs)
            .append(usersContent)
            .append(settingsContent)
            .daModal({title: 'Manage deviantART Filters', width: '50%', height: '75%', footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" script by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'});

        $('a.manage-filters-tab').on('click', function() {
            var tab = $(this).attr('data-tab');
            $('a.manage-filters-tab').removeClass('active');
            $('div.manage-filters-tab-content').addClass('hidden');
            $(this).addClass('active');
            $('#' + tab).removeClass('hidden');
        });

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    run() {
        if (DEBUG) console.group('deviantARTFilter.run()');

        if (this.usePlaceholders) {
            $('body').addClass('placeholders');
        } else {
            $('body').addClass('no-placeholders');
        }

        this.insertBaseCSS();
        this.insertHiddenUsersCSS(this.hiddenUsers);
        this.addControls();
        this.addEventSubsribers();

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    buildFilteredUsersTable() {
        if (DEBUG) console.group('deviantARTFilter.buildFilteredUsersTable()');

        this.cleanHiddenObjects('users', false);

        var users = this.hiddenUsers;
        if (DEBUG) console.log('Building table for users:', users);

        var usersTable = $('<table/>')
            .addClass('manage-filters-table')
            .attr('id', 'manage-users-table')
            .append('<tr><th>Username</th><th>Action</th></tr>');

        var userRow = $('<tr/>');

        var userNameField = $('<input/>')
            .attr('id', 'username')
            .attr('name', 'username')
            .attr('placeholder', 'Username')
            .attr('type', 'text')
            .wrap('<td/>').parent()
            .appendTo(userRow);

        var hideUserButton = $('<button/>')
            .addClass('smbutton smbutton-red smbutton-shadow')
            .attr('id', 'hide-user-button')
            .html('Hide User')
            .on('click', $.proxy(this.hideUserButtonClickHandler, this))
            .wrap('<td/>').parent()
            .appendTo(userRow);

        usersTable.append(userRow);

        for (var i = 0; i < users.length; i++) {
            userRow = $('<tr/>');

            // username column/link
            if (typeof users[i].username !== 'undefined' && users[i].username !== null) {
                userRow.append('<td><a class="external" href="http://' + users[i].username + '.deviantart.com/" target="_blank">' + users[i].username + '</a></td>');
            } else {
                userRow.append('<td>---</td>');
            }

            // unhide user column/button
            var unhideUserLink = $('<button/>')
                .addClass('smbutton smbutton-green smbutton-shadow')
                .attr('username', users[i].username)
                .html('Unhide User')
                .on('click', $.proxy(this.unhideUserButtonClickHandler, this))
                .wrap('<td/>').parent()
                .appendTo(userRow);

            usersTable.append(userRow);
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return usersTable;
    }

    cleanHiddenObjects(objectType, strictFiltering = false) {
        if (DEBUG) console.group('deviantARTFilter.cleanHiddenObjects()');

        var dirty = [],
            clean = [];
        var object, list;
        var changed = false;

        switch (objectType) {
            case 'users':
                dirty = this.hiddenUsers;
                list = 'hiddenUsers';
            break;
        }

        if (DEBUG) console.log('Dirty objects (' + list + ')', dirty);

        for (var i = 0; i < dirty.length; i++) {
            switch (objectType) {
                case 'users':
                    delete dirty[i]['userid'];
                    dirty[i]['username'] = dirty[i]['username'].toLowerCase();
                    object = new User(dirty[i]['username']);
                    break;
            }
            if (strictFiltering) {
                if (object.isComplete()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            } else {
                if (object.isValid()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            }
        }

        if (DEBUG) console.log('Valid objects', clean);

        switch (objectType) {
            case 'users':
                this.hiddenUsers = clean;
            break;
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return changed;
    }

    resetHiddenObjects(objectType) {
        if (DEBUG) console.group('deviantARTFilter.resetHiddenObjects()');

        switch (objectType) {
            case 'users':
                this.hiddenUsers = [];
            break;
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }

    exportFilters() {
        if (DEBUG) console.group('deviantARTFilter.exportFilters()');

        var filters = { };

        var users = this.hiddenUsers;

        if (typeof users !== 'undefined' && users !== null) {
            filters['users'] = users;
        }

        if (DEBUG) console.log('filters', filters);

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return filters;
    }

    importFilters(filters) {
        if (DEBUG) console.group('deviantARTFilter.importFilters()');

        if (DEBUG) console.log('filters', filters);

        var user,
            importedUsers = {"Total" : 0, "Success" : 0, "Existing" : 0, "Invalid" : 0};

        if (typeof filters['users'] !== 'undefined' && filters['users'] !== null) {
            var users = filters['users'];
            importedUsers.Total = users.length;
            if (DEBUG) console.log('Hiding users', users);
            for (var i = 0; i < users.length; i++) {
                user = new User(users[i]['username']);
                if (!user.isValid()) {
                    importedUsers.Invalid++;
                } else if (user.isHidden()) {
                    importedUsers.Existing++;
                } else if (user.hide()) {
                    importedUsers.Success++;
                }
            }
        }

        var results = "Import finished successfully.\n";

        results += "\nUsers:\n";
        for (var prop in importedUsers) {
            if (importedUsers.hasOwnProperty(prop)) {
                results += "- " + prop + ": " + importedUsers[prop] + "\n";
            }
        }

        alert(results + "\n\nChanges will take effect on next page load/refresh.");

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();
    }
}

/**
 * Base object for filterable deviantART objects
 */
class FilterObject {
    constructor(hiddenListName = '', objectName = 'FilterObject', objectProperties = [], uniqueProperties = []) {
        this.hiddenListName = hiddenListName;
        this.objectName = objectName;
        this.objectProperties = objectProperties;
        this.uniqueProperties = uniqueProperties;
    }

    /**
     * Determines if the FilterObject has all stored properties populated
     *
     * @return bool
     */
    isComplete() {
        if (DEBUG) console.group(this.objectName + '.isComplete()');
        var ret = true;

        for (var i = 0; i < this.objectProperties.length; i++) {
            if (DEBUG) console.log(this.objectProperties[i], this[this.objectProperties[i]]);
            ret = ret && (typeof this[this.objectProperties[i]] !== 'undefined' && this[this.objectProperties[i]] !== null);
        }

        if (DEBUG) console.log(ret);

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return ret;
    }

    /**
     * Determines if the FilterObject is currently hidden
     *
     * @return bool
     */
    isHidden() {
        if (DEBUG) console.group(this.objectName + '.isHidden()');

        var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
        var idx = this.findInArray(hidden);
        var isHidden = (idx >= 0);

        if (isHidden) {
            if (DEBUG) console.log(this.objectName + ' is hidden.');
        } else {
            if (DEBUG) console.log(this.objectName + ' is NOT hidden.');
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return isHidden;
    }

    /**
     * Determines if the FilterObject has at least one stored property populated
     *
     * @return bool
     */
    isValid() {
        if (DEBUG) console.group(this.objectName + '.isValid()');
        var ret = false;

        for (var i = 0; i < this.objectProperties.length; i++) {
            if (DEBUG) console.log(this.objectProperties[i], this[this.objectProperties[i]]);
            ret = ret || (typeof this[this.objectProperties[i]] !== 'undefined' && this[this.objectProperties[i]] !== null);
        }

        if (DEBUG) console.log(ret);

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return ret;
    }

    /**
     * Hides the FilterObject by adding it from the stored list of hidden FilterObjects
     *
     * @return bool If the FilterObject was successfully hidden
     */
    hide() {
        if (DEBUG) console.group(this.objectName + '.hide()');

        var hide = true;
        if (this.isHidden()) {
            if (DEBUG) console.log(this.objectName + ' is already hidden.');
            hide = false;
        } else if (!this.isValid()) {
            if (DEBUG) console.log(this.objectName + ' is not valid.');
            hide = false;
        }

        if (hide) {
            var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
            var tmp = new Object();
            for (var i = 0; i < this.objectProperties.length; i++) {
                tmp[this.objectProperties[i]] = this[this.objectProperties[i]];
            }
            hidden.push(tmp);

            GM_setValue(this.hiddenListName, JSON.stringify(hidden));

            if (DEBUG) console.log(hidden);
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return hide;
    }

    /**
     * Finds the FilterObject in an array of FilterObjects
     *
     * @param  array theArray The array of FilterObjects to search
     * @return int            The index of the FilterObject in the array (-1 if not found)
     */
    findInArray(theArray) {
        if (DEBUG) console.group(this.objectName + '.findInArray()');

        if (DEBUG) console.log('Looping through ' + theArray.length + ' FilterObjects.');
        var idx = -1,
            property;
        for (var i = 0; i < theArray.length; i++) {
            for (var j = 0; j < this.uniqueProperties.length; j++) {
                property = this.uniqueProperties[j];
                if (typeof theArray[i][property] !== 'undefined' && theArray[i][property] !== null) {
                    if (theArray[i][property] === this[property]) {
                        if (DEBUG) console.log('Found ' + this.objectName + ' by ' + property + ' at index ' + i + '.');
                        idx = i;
                        break;
                    }
                }
            }
        }

        if (DEBUG) console.log('Returning: ' + idx);

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return idx;
    }

    /**
     * Unhides (shows) the FilterObject by removing it from the stored list of hidden FilterObjects
     *
     * @return bool If the FilterObject was hidden initially
     */
    unhide() {
        if (DEBUG) console.group(this.objectName + '.hide()');

        if (!this.isHidden()) {
            if (DEBUG) console.log(this.objectName + ' is not already hidden.');
            return false;
        }

        var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
        var idx = this.findInArray(hidden);
        var ret = (idx >= 0);

        if (ret) {
            hidden.splice(idx, 1);

            if (DEBUG) console.log('Updating stored list of hidden ' + this.objectName + 's.');
            GM_setValue(this.hiddenListName, JSON.stringify(hidden));
        }

        if (DEBUG) console.log('Complete');
        if (DEBUG) console.groupEnd();

        return ret;
    }
}

/**
 * User object represents a deviantART user (a.k.a. deviant)
 * Extends FilterObject
 *
 * @param string username The name of the user
 */
class User extends FilterObject {
    constructor(username) {
        super('hiddenUsers', 'User', ['username'], ['username']);

        this.username = username.toLowerCase();
    }
}

(function() {
    var daFilter = new deviantARTFilter();
    daFilter.run();
})();


/**
 * Simple deviantART Modal Plugin
 * @author Ryan Thaut
 */
(function ($) {
    $.fn.daModal = function(options) {
        return $.daModal.init(this, options);
    }

    $.daModal = {
        defaults: {
            title:  '',
            footnote: '',
            width:  '50%',
            height: '50%',
        },

        objects: {
            overlay: null,
            modal: null,
        },

        init: function(elem, options) {
            $.daModal.create(elem, options);
            $.daModal.open();
            return elem;
        },

        create: function(elem, options) {
            var settings = $.extend({}, $.daModal.defaults, options);

            var modal = $('<div/>')
                .addClass('modal modal-rounded with-shadow')
                .css({
                    display:        'none',
                    position:       'fixed',
                    width:          settings.width,
                    height:         settings.height,
                    left:           'calc((100% - ' + settings.width + ') / 2)',
                    top:            'calc((100% - ' + settings.height + ') / 2)',
                    zIndex:         200,
                })
                .appendTo('body');
            $.daModal.objects.modal = modal;

            var close = $('<a/>')
                .addClass('x')
                .on('click', this.close)
                .appendTo(modal);

            var title = $('<h2/>')
                .html(settings.title)
                .appendTo(modal);

            var content = $('<div/>')
                .addClass('daModal-content')
                .attr('id', 'modal-content')
                .css({
                    overflow:       'auto',
                    padding:        '15px',
                    height:         'calc(100% - 54px - 50px - 30px)', // 54px: header; 50px: footer (buttons); 30px: vertical padding
                    width:          'calc(100% - 30px)',        // 30px: horizontal padding
                })
                .appendTo(modal)
                .append(elem);

            var footer = $('<div/>')
                .css({
                    borderTop:      '1px solid #AAB5AB',
                    boxShadow:      '0 1px 0 rgba(255, 255, 255, 0.75) inset',
                    height:         '50px',
                    margin:         '0 15px',
                    textAlign:      'right',
                })
                .appendTo(modal);

            var footnote = $('<small/>')
                .addClass('text')
                .css({
                    float:          'left',
                    lineHeight:     '50px',
                })
                .html(settings.footnote)
                .appendTo(footer);

            var done = $('<a/>')
                .addClass('smbutton smbutton-lightgreen smbutton-size-large smbutton-shadow')
                .html('Done')
                .on('click', this.close)
                .appendTo(footer);

            var overlay = $('<div/>')
                .attr('id', 'modalfade')
                .on('click', this.close)
                .appendTo('body');
            $.daModal.objects.overlay = overlay;

            return elem;
        },

        open: function() {
            $.daModal.objects.overlay.show();
            $.daModal.objects.modal.show();
        },

        close: function() {
            $.daModal.objects.modal.hide().remove();
            $.daModal.objects.overlay.hide().remove();
        }
    };
}(jQuery));
