// ==UserScript==
// @name        deviantART Filter Beta
// @author      Ryan Thaut
// @description Allows automatic filtering of deviations from certain users and/or in certain categories.
// @namespace   http://repo.ryanthaut.com/userscripts/deviantart_filter
// @updateURL   http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter_Beta.user.js
// @downloadURL http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter_Beta.user.js
// @include     http://*deviantart.com/*
// @version     2.0b6
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @require     http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

var deviantARTFilter = function() {
    console.group('construct');

    this.placeholders = GM_getValue('placeholders', true);
    this.cascadingCategories = GM_getValue('cascadingCategories', true);

    console.log('complete');
    console.groupEnd();

    return this;
};
deviantARTFilter.prototype = {
    constructor: deviantARTFilter,

    getHiddenUsers: function() {
        return JSON.parse(GM_getValue('hiddenUsers', '[]'))
    },

    getHiddenCategories: function() {
        return JSON.parse(GM_getValue('hiddenCategories', '[]'))
    },

    addControls: function() {
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

        var results = $('#browse-results');
        if (results.length == 1) {
            console.log('Processing Browse page.');
            var query_params = $('#browse-results').attr('gmon-query_params');
            if (query_params.length) {
                query_params = JSON.parse(query_params);
                console.log('Browse query', query_params);
                if (typeof query_params.category_path !== 'undefined' && query_params.category_path.length) {
                    console.log('Adding category toggle link.');

                    var hideCategoryLink = $('<a/>')
                        .html('Hide Category')
                        .addClass('hide-category')
                        .on('click', $.proxy(this.hideCategoryClickHandler, this));

                    $('.search-stats', '.browse-top-bar').append(hideCategoryLink);
                }
            }
        }

        console.log('Complete');
        console.groupEnd();
    },

    insertBaseCSS: function() {
        console.group('deviantARTFilter.insertBaseCSS()');

        var css = '';

        css += '#overhead #oh-menu-filters { background: #46584A; border-bottom: 1px solid #38463B; }';
        css += '#overhead #oh-menu-filters a.oh-l { cursor: pointer; height: 49px; line-height: 50px; padding: 0 6px; }';

        css += 'a.hide-user { cursor: pointer; position: absolute; height: 25px; line-height: 25px; width: 100%; left: 0px; top: 0px; z-index: 1; color: #FFFFFF; text-align: left; text-indent: -9999px; }';
        css += '.tt-a:hover a.hide-user span { position: absolute; background: url("http://st.deviantart.net/minish/messages/close-message.gif") repeat 30px 0; height: 15px; width: 15px; right: 5px; top: 5px; }';
        css += 'a.hide-user:hover { background: #A51818; text-indent: 10px; }';

        css += 'a.hide-category { color: #A51818; cursor: pointer; }';

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

        GM_addStyle(css);

        console.log('Complete');
        console.groupEnd();
    },

    insertHiddenUsersCSS: function(users) {
        console.group('deviantARTFilter.insertHiddenUsersCSS()');

        console.log("Hiding user(s):", users);

        var css1 = '',  // no placeholders
            css2 = '';  // placeholders

        for (var i = 0; i < users.length; i++) {
            if (typeof users[i].userid !== 'undefined' && users[i].userid !== null) {
                css1 += 'body.no-placeholders *[userid="' + users[i].userid + '"], ';
                css2 += 'body.placeholders *[userid="' + users[i].userid + '"] a.thumb:before, ';
            }

            if (typeof users[i].username !== 'undefined' && users[i].username !== null) {
                css1 += 'body.no-placeholders *[username="' + users[i].username + '"], ';
                css2 += 'body.placeholders *[username="' + users[i].username + '"] a.thumb:before, ';
            }
        }

        if (css1.length > 0) {
            // no placeholders
            css1 = css1.replace(/, $/, '');
            css1 += ' { display: none !important; }';
        }

        if (css2.length > 0) {
            // placeholders
            css2 = css2.replace(/, $/, '');
            css2 += ' { position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url("http://st.deviantart.net/misc/noentry-green.png") no-repeat center center; display: block; }';
        }

        GM_addStyle(css1 + "\n" + css2);

        console.log('Complete');
        console.groupEnd();
    },

    insertHiddenCategoriesCSS: function(categories) {
        console.group('deviantARTFilter.insertHiddenCategoriesCSS()');

        console.log("Hiding category(s):", categories);

        var css1 = '',  // no placeholders
            css2 = '';  // placeholders

        var selector = (this.cascadingCategories) ? '^=' : '=';
        for (var i = 0; i < categories.length; i++) {
            if (typeof categories[i].longname !== 'undefined' && categories[i].longname !== null) {
                css1 += 'body.no-placeholders *[category' + selector + '"' + categories[i].longname + '"], ';
                css2 += 'body.placeholders *[category' + selector + '"' + categories[i].longname + '"] a.thumb:before, ';
            }
        }

        if (css1.length > 0) {
            // no placeholders
            css1 = css1.replace(/, $/, '');
            css1 += ' { display: none !important; }';
        }

        if (css2.length > 0) {
            // placeholders
            css2 = css2.replace(/, $/, '');
            css2 += ' { position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url("http://st.deviantart.net/misc/noentry-green.png") no-repeat center center; display: block; z-index: 1; }';
        }

        GM_addStyle(css1 + "\n" + css2);

        console.log('Complete');
        console.groupEnd();
    },

    addEventSubsribers: function() {
        console.group('deviantARTFilter.addEventSubsribers()');

        $('#browse-results').on('mouseover', 'div.tt-a', function() {
            var thumb = $(this);
            var control = $('a.hide-user', thumb);
            if (!control.length) {
                control = $('<a/>').addClass('hide-user').html('Hide User<span></span>');
                control.attr('userid', thumb.attr('userid'));
                control.attr('username', thumb.attr('username'));
                thumb.find('a.thumb').before(control);
            }
        });

        $('#browse-results').on('click', 'a.hide-user', $.proxy(this.hideUserDeviationClickHandler, this));

        console.log('Complete');
        console.groupEnd();
    },

    hideUserButtonClickHandler: function(event) {
        console.group('deviantARTFilter.hideUserButtonClickHandler()');

        var userid = $('input#userid').val();
        var username = $('input#username').val();

        if (userid === '' && username === '')
        {
            alert('You must provide either a Username or User ID.');
            return false;
        }

        var user = new User(userid, username);

        this.hideUser(user);

        // @TODO maybe just destroy the table and rebuild it?
        // Or break out the for loop logic in buildFilteredUsersTable() to prevent code duplication
        console.log("Inserting newly hidden user into table");
        var userRow = $('<tr/>');

        // username column/link
        if (username !== null) {
            userRow.append('<td><a class="external" href="http://' + username + '.deviantart.com/" target="_blank">' + username + '</a></td>');
        } else {
            userRow.append('<td>---</td>');
        }

        // userid column
        if (userid !== null) {
            userRow.append('<td>' + userid + '</td>');
        } else {
            userRow.append('<td>---</td>');
        }

        // unhide user column/link
        var unhideUserLink = $('<button/>')
            .addClass('smbutton smbutton-green smbutton-shadow')
            .attr('userid', userid)
            .attr('username', username)
            .html('Unhide User')
            .on('click', function() {
                //unhideUser($(this).attr('userid'), $(this).attr('username'));
                $(this).parents('tr').hide().remove();
            })
            .wrap('<td/>').parent()
            .appendTo(userRow);

        $('table#manage-users-table').append(userRow);

        console.log('Complete');
        console.groupEnd();
    },

    unhideUserButtonClickHandler: function(event) {
        console.group('deviantARTFilter.unhideUserButtonClickHandler()');

        var target = $(event.target);
        var user = new User(target.attr('userid'), target.attr('username'));

        console.log('Created new User object', user);

        if (this.unhideUser(user)) {
            // @TODO maybe just destroy the table and rebuild it?
            console.log("Removing newly unhidden user from table");
            target.parents('tr').remove();
        }

        console.log('Complete');
        console.groupEnd();
    },

    hideUserDeviationClickHandler: function(event) {
        console.group('deviantARTFilter.hideUserDeviationClickHandler()');

        var target = $(event.target);
        var user = new User(target.attr('userid'), target.attr('username'));

        console.log('Created new User object', user);

        this.hideUser(user);

        console.log('Complete');
        console.groupEnd();
    },

    hideUser: function(user) {
        console.group('deviantARTFilter.hideUser()');

        var ret = false;

        if (user.isHidden()) {
            alert('This user ("' + user.username + '") is already hidden.');
        } else {
            if (user.hide()) {
                this.insertHiddenUsersCSS([user]);
                ret = true;
            }
        }

        console.log('Complete');
        console.groupEnd();

        return ret;
    },

    unhideUser: function(user) {
        console.group('deviantARTFilter.unhideUser()');

        var ret = false;

        if (user.unhide()) {
            alert('Changes will take effect on next page load/refresh');
            ret = true;
        }

        console.log('Complete');
        console.groupEnd();

        return ret;
    },

    unhideCategoryButtonClickHandler: function(event) {
        console.group('deviantARTFilter.unhideCategoryButtonClickHandler()');

        var target = $(event.target);
        var category = new Category(target.attr('shortname'), target.attr('longname'), null);

        console.log('Created new Category object', category);

        if (this.unhideCategory(category)) {
            // @TODO maybe just destroy the table and rebuild it?
            console.log("Removing newly unhidden category from table");
            target.parents('tr').remove();
        }

        console.log('Complete');
        console.groupEnd();
    },

    hideCategoryClickHandler: function(event) {
        console.group('deviantARTFilter.hideCategoryClickHandler()');

        var query_params = JSON.parse($('#browse-results').attr('gmon-query_params'));

        var hierarchy = [];
        var hierItem = $('#browse-sidemenu .browse-facet-category a.selected');
        var depth = parseInt(hierItem.attr('class').replace('cat-depth-', ''), 10);

        var shortname = hierItem.text().trim();
        var longname = query_params.category_path;

        hierarchy.push(shortname);
        for (var i = (depth - 1); i > 0; i--) {
            hierItem = $('#browse-sidemenu .browse-facet-category a.cat-depth-' + i);
            hierarchy.push(hierItem.text().trim());
        }
        hierarchy.reverse();

        var category = new Category(shortname, longname, hierarchy);
        console.log('Created new Category object', category);

        this.hideCategory(category);

        console.log('Complete');
        console.groupEnd();
    },

    hideCategory: function(category) {
        console.group('deviantARTFilter.hideCategory()');

        if (category.isHidden()) {
            alert('This category ("' + category.shortname + '") is already hidden.');
        } else {
            if (category.hide()) {
                this.insertHiddenCategoriesCSS([category]);
            }
        }

        console.log('Complete');
        console.groupEnd();
    },

    unhideCategory: function(category) {
        console.group('deviantARTFilter.unhideCategory()');

        if (category.unhide()) {
            alert('Changes will take effect on next page load/refresh');
            //this.removeHiddenCategoriesCSS([category]);
        }

        console.log('Complete');
        console.groupEnd();
    },

    toggleSettingChangeEventHandler: function(event) {
        console.group('deviantARTFilter.toggleSettingChangeEventHandler()');

        var target = $(event.target);
        var setting = target.attr('name');

        console.log('Toggling setting "' + setting + '".');

        switch (setting) {
            case 'placeholders':
                this.placeholders = !this.placeholders;
                GM_setValue('placeholders', this.placeholders);
                $('body').toggleClass('no-placeholders');
                $('body').toggleClass('placeholders');
                break;

            case 'cascadingCategories':
                this.cascadingCategories = !this.cascadingCategories;
                GM_setValue('cascadingCategories', this.cascadingCategories);
                alert('Changes will take effect on next page load/refresh');
                break;
        }

        console.log('Complete');
        console.groupEnd();
    },

    cleanObjectsClickEventHandler: function(event) {
        console.group('deviantARTFilter.cleanObjectsClickEventHandler()');

        event.preventDefault();

        var target = $(event.target);
        var object = target.attr('name');
        var strict = (target.attr('strict') === 'true');

        console.log('Cleaning ' + object + '.');

        var changed = this.cleanHiddenObjects(object, strict);

        if (changed) {
            alert('Changes will take effect on next page load/refresh');
        } else {
            alert('Your hidden ' + object + ' are clean; no changes were made');
        }

        console.log('Complete');
        console.groupEnd();
    },

    manage: function(event) {
        console.group('deviantARTFilter.manage()');

        var tabs = $('<div>')
            .addClass('manage-filters-tabs');

        var usersTab = $('<a/>')
            .addClass('manage-filters-tab')
            .addClass('active')
            .attr('data-tab', 'manage-users-tab-content')
            .html('Filtered Users')
            .appendTo(tabs);

        var categoriesTab = $('<a/>')
            .addClass('manage-filters-tab')
            .attr('data-tab', 'manage-categories-tab-content')
            .html('Filtered Categories')
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

        var categoriesContent = $('<div/>')
            .addClass('manage-filters-tab-content')
            .attr('id', 'manage-categories-tab-content')
            .addClass('hidden');

        var categoriesTable = this.buildFilteredCategoriesTable()
            .appendTo(categoriesContent);

        var settingsContent = $('<div/>')
            .addClass('manage-filters-tab-content')
            .attr('id', 'manage-settings-tab-content')
            .addClass('hidden');

        var settingsForm = $('<form/>')
            .addClass('manage-filters-settings').
            appendTo(settingsContent);

        var placeholdersWrapper = $('<fieldset/>').appendTo(settingsForm);

        var placeholdersInput = $('<input/>')
            .attr('type', 'checkbox')
            .attr('id', 'placeholders')
            .attr('name', 'placeholders')
            .attr('checked', this.placeholders)
            .on('change', $.proxy(this.toggleSettingChangeEventHandler, this))
            .appendTo(placeholdersWrapper);

        var placeholdersLabel = $('<label/>')
            .attr('for', 'placeholders')
            .html(' Use placeholders for hidden deviations')
            .append('<br/><small>(Disabling this will hide deviations completely)</small>')
            .appendTo(placeholdersWrapper);

        var cascadingCategoriesWrapper = $('<fieldset/>').appendTo(settingsForm);

        var cascadingCategoriesInput = $('<input/>')
            .attr('type', 'checkbox')
            .attr('id', 'cascadingCategories')
            .attr('name', 'cascadingCategories')
            .attr('checked', this.cascadingCategories)
            .on('change', $.proxy(this.toggleSettingChangeEventHandler, this))
            .appendTo(cascadingCategoriesWrapper);

        var cascadingCategoriesLabel = $('<label/>')
            .attr('for', 'cascadingCategories')
            .html(' Cascade filtered categories')
            .append('<br/><small>(Disabling this will <strong>not</strong> hide deviations in sub-categories of hidden categories)</small>')
            .appendTo(cascadingCategoriesWrapper);

        var cleanUsersButton = $('<button/>')
            .html('Clean Hidden Users')
            .attr('name', 'users')
            .attr('strict', false)
            .on('click', $.proxy(this.cleanObjectsClickEventHandler, this))
            .appendTo(settingsForm);

        var cleanCategoriesButton = $('<button/>')
            .html('Clean Hidden Categories')
            .attr('name', 'categories')
            .attr('strict', false)
            .on('click', $.proxy(this.cleanObjectsClickEventHandler, this))
            .appendTo(settingsForm);

        var content = $('<div/>')
            .append(tabs)
            .append(usersContent)
            .append(categoriesContent)
            .append(settingsContent)
            .daModal({title: 'Manage deviantART Filters', width: '50%', height: '75%', footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" script by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'});

        $('a.manage-filters-tab').on('click', function() {
            var tab = $(this).attr('data-tab');
            $('a.manage-filters-tab').removeClass('active');
            $('div.manage-filters-tab-content').addClass('hidden');
            $(this).addClass('active');
            $('#' + tab).removeClass('hidden');
        });

        console.log('Complete');
        console.groupEnd();
    },

    setup: function() {
        console.group('deviantARTFilter.setup()');

        if (this.placeholders) {
            $('body').addClass('placeholders');
        } else {
            $('body').addClass('no-placeholders');
        }

        this.insertBaseCSS();
        this.insertHiddenUsersCSS(this.getHiddenUsers());
        this.insertHiddenCategoriesCSS(this.getHiddenCategories());
        this.addControls();
        this.addEventSubsribers();

        console.log('Complete');
        console.groupEnd();
    },

    buildFilteredUsersTable: function() {
        console.group('deviantARTFilter.buildFilteredUsersTable()');
        var users = this.getHiddenUsers();
        console.log('Building table for users:', users);

        var usersTable = $('<table/>')
            .addClass('manage-filters-table')
            .attr('id', 'manage-users-table')
            .append('<tr><th>Username</th><th>User ID</th><th>Action</th></tr>');

        var userRow = $('<tr/>');

        var userNameField = $('<input/>')
            .attr('id', 'username')
            .attr('name', 'username')
            .attr('placeholder', 'Username (Optional)')
            .attr('type', 'text')
            .wrap('<td/>').parent()
            .appendTo(userRow);

        var userIDField = $('<input/>')
            .attr('id', 'userid')
            .attr('name', 'userid')
            .attr('placeholder', 'User ID (Optional)')
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

            // userid column
            if (typeof users[i].userid !== 'undefined' && users[i].userid !== null) {
                userRow.append('<td>' + users[i].userid + '</td>');
            } else {
                userRow.append('<td>---</td>');
            }

            // unhide user column/button
            var unhideUserLink = $('<button/>')
                .addClass('smbutton smbutton-green smbutton-shadow')
                .attr('userid', users[i].userid)
                .attr('username', users[i].username)
                .html('Unhide User')
                .on('click', $.proxy(this.unhideUserButtonClickHandler, this))
                .wrap('<td/>').parent()
                .appendTo(userRow);

            usersTable.append(userRow);
        }

        console.log('Complete');
        console.groupEnd();

        return usersTable;
    },

    buildFilteredCategoriesTable: function() {
        console.group('deviantARTFilter.buildFilteredCategoriesTable()');

        // since v2.0 categories need all at least "longname" and "shortname"
        // but prior to v2.0 there was only "longname"
        if (this.cleanHiddenObjects('categories', true)) {
            alert("One or more of your hidden categories has been has been removed due to incompatibility with this version of the script.\n\nYou can re-hide categories by navigating to a category page and using the red link next to the category title.");
        }

        var categories = this.getHiddenCategories();
        console.log('Building table for categories:', categories);

        var categoriesTable = $('<table/>')
            .addClass('manage-filters-table')
            .attr('id', 'manage-categories-table')
            .append('<tr><th>Category Name</th><th>Category Path</th><th>Action</th></tr>');

        var categoryRow;

        for (var i = 0; i < categories.length; i++) {
            categoryRow = $('<tr/>')

            // category name column/link
            categoryRow.append('<td><a class="external" href="http://www.deviantart.com/browse/all/' + categories[i].longname + '" target="_blank">' + categories[i].shortname + '</a></td>');

            // category hierarchy column
            if (typeof categories[i].hierarchy !== 'undefined' && categories[i].hierarchy !== null) {
                categoryRow.append('<td>' + categories[i].hierarchy.join(' > ') + '</td>');
            } else {
                categoryRow.append('<td>---</td>');
            }

            // unhide category column/button
            var unhideCategoryLink = $('<button/>')
                .addClass('smbutton smbutton-green smbutton-shadow')
                .attr('shortname', categories[i].shortname)
                .attr('longname', categories[i].longname)
                .html('Unhide Category')
                .on('click', $.proxy(this.unhideCategoryButtonClickHandler, this))
                .wrap('<td/>').parent()
                .appendTo(categoryRow);

            categoriesTable.append(categoryRow);
        }

        console.log('Complete');
        console.groupEnd();

        return categoriesTable;
    },

    cleanHiddenObjects: function(objectType, strictFiltering) {
        console.group('deviantARTFilter.cleanHiddenObjects()');

        var dirty = clean = [];
        var object, list;
        var changed = false;

        switch (objectType) {
            case 'users':
                dirty = this.getHiddenUsers();
                list = 'hiddenUsers';
                break;
            case 'categories':
                dirty = this.getHiddenCategories();
                list = 'hiddenCategories';
                break;
        }

        for (var i = 0; i < dirty.length; i++) {
            switch (objectType) {
                case 'users':
                    object = new User(dirty[i]['userid'], dirty[i]['username']);
                    break;
                case 'categories':
                    object = new Category(dirty[i]['shortname'], dirty[i]['longname'], dirty[i]['hierarchy']);
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

        console.log('Valid objects', dirty);

        if (changed) {
            GM_setValue(list, JSON.stringify(clean));
        }

        console.log('Complete');
        console.groupEnd();

        return changed;
    }
};

/**
 * Base object for filterable deviantART objects
 */
var filterObject = function() {
    this.hiddenListName = '';
    this.objectName = 'filterObject';
    this.objectProperties = [];
    this.uniqueProperties = [];
};
filterObject.prototype = {
    constructor: filterObject,

    /**
     * Determines if the filterObject has all stored properties populated
     *
     * @return bool
     */
    isComplete: function() {
        console.group(this.objectName + '.isComplete()');
        var ret = true;

        for (var i = 0; i < this.objectProperties.length; i++) {
            console.log(this.objectProperties[i], this[this.objectProperties[i]]);
            ret = ret && (typeof this[this.objectProperties[i]] !== 'undefined' && this[this.objectProperties[i]] !== null);
        }

        console.log(ret);

        console.log('Complete');
        console.groupEnd();

        return ret;
    },

    /**
     * Determines if the filterObject is currently hidden
     *
     * @return bool
     */
    isHidden: function() {
        console.group(this.objectName + '.isHidden()');

        var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
        var idx = this.findInArray(hidden);
        var isHidden = (idx >= 0);

        if (isHidden) {
            console.log(this.objectName + ' is hidden.');
        } else {
            console.log(this.objectName + ' is NOT hidden.');
        }

        console.log('Complete');
        console.groupEnd();

        return isHidden;
    },

    /**
     * Determines if the filterObject has at least one stored property populated
     *
     * @return bool
     */
    isValid: function() {
        console.group(this.objectName + '.isValid()');
        var ret = false;

        for (var i = 0; i < this.objectProperties.length; i++) {
            console.log(this.objectProperties[i], this[this.objectProperties[i]]);
            ret = ret || (typeof this[this.objectProperties[i]] !== 'undefined' && this[this.objectProperties[i]] !== null);
        }

        console.log(ret);

        console.log('Complete');
        console.groupEnd();

        return ret;
    },

    /**
     * Hides the filterObject by adding it from the stored list of hidden filterObjects
     *
     * @return bool If the filterObject was successfully hidden
     */
    hide: function() {
        console.group(this.objectName + '.hide()');

        if (this.isHidden()) {
            console.log(this.objectName + ' is already hidden.');
            return false;
        } else if (!this.isValid()) {
            console.log(this.objectName + ' is not valid.');
            return false;
        }

        var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
        var tmp = new Object();
        for (var i = 0; i < this.objectProperties.length; i++) {
            tmp[this.objectProperties[i]] = this[this.objectProperties[i]];
        }
        hidden.push(tmp);

        GM_setValue(this.hiddenListName, JSON.stringify(hidden));

        console.log(hidden);

        console.log('Complete');
        console.groupEnd();

        return true;
    },

    /**
     * Finds the filterObject in an array of filterObjects
     *
     * @param  array theArray The array of filterObjects to search
     * @return int            The index of the filterObject in the array (-1 if not found)
     */
    findInArray: function(theArray) {
        console.group(this.objectName + '.findInArray()');

        console.log('Looping through ' + theArray.length + ' filterObjects.');
        var idx = -1,
            property;
        for (var i = 0; i < theArray.length; i++) {
            for (var j = 0; j < this.uniqueProperties.length; j++) {
                property = this.uniqueProperties[j];
                if (typeof theArray[i][property] !== 'undefined' && theArray[i][property] !== null) {
                    if (theArray[i][property] === this[property]) {
                        console.log('Found ' + this.objectName + ' by ' + property + ' at index ' + i + '.');
                        idx = i;
                        break;
                    }
                }
            }
        }

        console.log('Returning: ' + idx);

        console.log('Complete');
        console.groupEnd();

        return idx;
    },

    /**
     * Unhides (shows) the filterObject by removing it from the stored list of hidden filterObjects
     *
     * @return bool If the filterObject was hidden initially
     */
    unhide: function() {
        console.group(this.objectName + '.hide()');

        if (!this.isHidden()) {
            console.log(this.objectName + ' is not already hidden.');
            return false;
        }

        var hidden = JSON.parse(GM_getValue(this.hiddenListName, '[]'));
        var idx = this.findInArray(hidden);
        var ret = (idx >= 0);

        if (ret) {
            hidden.splice(idx, 1);

            console.log('Updating stored list of hidden ' + this.objectName + 's.');
            GM_setValue(this.hiddenListName, JSON.stringify(hidden));
        }

        console.log('Complete');
        console.groupEnd();

        return ret;
    }
};

/**
 * Category object represents a deviantART category
 * Extends filterObject
 *
 * @param string shortname The title of the category
 * @param string longname  The URL path of the category
 * @param array hierarchy The hierarchy structure to the category
 */
var Category = function(shortname, longname, hierarchy) {
    filterObject.call(this);

    this.hiddenListName = 'hiddenCategories';
    this.objectName = 'Category';
    this.objectProperties = ['shortname', 'longname', 'hierarchy'];
    this.uniqueProperties = ['longname'];

    this.shortname = shortname;
    this.longname = longname;
    this.hierarchy = hierarchy;
};
Category.prototype = new filterObject();
Category.prototype.constructor = Category;

/**
 * User object represents a deviantART user (a.k.a. deviant)
 * Extends filterObject
 *
 * @param string userid   The ID of the user (really an integer)
 * @param string username The name of the user
 */
var User = function(userid, username) {
    filterObject.call(this);

    this.hiddenListName = 'hiddenUsers';
    this.objectName = 'User';
    this.objectProperties = ['userid', 'username'];
    this.uniqueProperties = ['userid', 'username'];

    this.userid = userid;
    this.username = username;
};
User.prototype = new filterObject();
User.prototype.constructor = User;


(function() {
    var daFilter = new deviantARTFilter();
    daFilter.setup();
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
