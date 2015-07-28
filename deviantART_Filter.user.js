// ==UserScript==
// @name        deviantART Filter
// @author      Ryan Thaut
// @description Allows automatic filtering of deviations from certain users and/or in certain categories.
// @namespace   http://repo.ryanthaut.com/userscripts/deviantart_filter
// @updateURL   http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter.user.js
// @downloadURL http://repo.ryanthaut.com/userscripts/deviantart_filter/deviantART_Filter.user.js
// @include     http://*deviantart.com/*
// @version     1.5.1
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @require     http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

var hiddenUsers = JSON.parse(GM_getValue('hiddenUsers', '[]'));
var hiddenCategories = JSON.parse(GM_getValue('hiddenCategories', '[]'));

var isProfile = false;
var isBrowse = false;

$(document).ready(init);

function init() {
    GM_addStyle(getCSS());
    if ($('body').hasClass('gruze')) {
        isProfile = true;
        processProfilePage()
    } else {
        isBrowse = true;
        insertManageFiltersButton();
        processBrowsePage();
    }
}

function processBrowsePage() {
    $('.browse-container').unbind('DOMNodeInserted', processBrowsePage);
    insertDeviationLinks();
    hideAllFilteredDeviations();
    $('.browse-container').bind('DOMNodeInserted', processBrowsePage);
}

function processProfilePage() {
    var container = $('#gmi-Gruser');
    var userID = container.attr('gmi-id');
    var userName = container.attr('gmi-name');

    var blocked = false;
    for (var i = 0; i < hiddenUsers.length; i++) {
        if (typeof hiddenUsers[i].userid !== 'undefined' && hiddenUsers[i].userid !== null && hiddenUsers[i].userid === userID) {
            blocked = true;
            break;
        } else if (typeof hiddenUsers[i].username !== 'undefined' && hiddenUsers[i].username !== null && hiddenUsers[i].username.toLowerCase() === userName.toLowerCase()) {
            blocked = true;
            break;
        }
    }

    if (blocked) {
        container.addClass('user-hidden');
    }

    insertManageUserLink(blocked);
}

function insertManageUserLink(blocked) {
    var action = (blocked) ? 'Unhide' : 'Hide';
    var filterLink = $('<a/>')
        .css({
            cursor: 'pointer'
        })
        .html('<i class="icon"></i><span>' + action + ' User\'s Deviations</span><b></b>')
        .addClass('gmbutton2 gmbutton2qn2r user-toggle-button')
        .on('click', toggleUser);

    $('.moarbuttons', '.catbar').prepend(filterLink);
}

function insertManageFiltersButton() {
    var manageLink = $('<a/>')
        .html('Manage Filters')
        .addClass('browse-link-button manage-filters-trigger')
        .on('click', manageFilters);

    $('.right-buttons', '.browse-top-bar').prepend(manageLink);
    $('.right-buttons', '.browse-top-bar').css('max-width', $('.right-buttons', '.browse-top-bar').width() + manageLink.width());
}

function hideAllFilteredDeviations() {
    for (var i = 0; i < hiddenUsers.length; i++) {
        // legacy support from prior to storing users as objects
        if (typeof hiddenUsers[i] !== 'object') {
            hiddenUsers[i] = {
                userid: hiddenUsers[i]
            };
        }

        hideDeviationsByUser(hiddenUsers[i].userid, hiddenUsers[i].username);
    }

    for (var i = 0; i < hiddenCategories.length; i++) {
        hideDeviationsByCategory(hiddenCategories[i].longname);
    }

    if (!GM_getValue('placeholders', true)) {
        $('body').addClass('no-placeholders');
    }
}

function insertDeviationLinks() {
    $('.browse-container .tt-a[processed!="yes"]').each(function() {
        var userID = $(this).attr('userid');
        var userName = $(this).attr('userName');
        var categoryName = $(this).attr('category');

        if (!(userID === null && userName === null)) {
            var toggleUserLink = $('<a/>')
                .addClass('user-toggle')
                .attr('href', 'http://' + userName + '.deviantart.com/')
                .html('<span class="user-toggle-text">Hide User\'s Deviations</span>')
                .on('click', toggleUser);

            $(this).find('.details').append(toggleUserLink);
        }

        $(this).find('.details').append($('<br/>'));

        if (categoryName !== null) {
            var toggleCategoryLink = $('<a/>')
                .addClass('category-toggle')
                .attr('href', 'http://www.deviantart.com/browse/all/' + categoryName)
                .html('<span class="category-toggle-text">Hide Category\'s Deviations</span>')
                .on('click', toggleCategory);

            $(this).find('.details').append(toggleCategoryLink);
        }

        $(this).attr('processed', 'yes');
    });
}

function toggleUser(e) {
    e.preventDefault();
    var container, userID, userName;
    if (isProfile) {
        container = $(this).parents('div#gmi-Gruser');
        userID = container.attr('gmi-id');
        userName = container.attr('gmi-name');
    } else if (isBrowse) {
        container = $(this).parents('div.tt-a');
        userID = container.attr('userid');
        userName = container.attr('username');
    }

    if (container.hasClass('user-hidden')) {
        showUser(userID, userName);
    } else {
        hideUser(userID, userName);
    }
}

function toggleCategory(e) {
    e.preventDefault();
    var container = $(this).parents('div.tt-a');
    var category = container.attr('category');

    if (container.hasClass('category-hidden')) {
        showCategory(category);
    } else {
        hideCategory(category);
    }
}

function isUserHidden(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    for (var i = 0; i < hiddenUsers.length; i++) {
        if (typeof hiddenUsers[i].userid !== 'undefined' && hiddenUsers[i].userid !== null && hiddenUsers[i].userid === userID) {
            return true;
        } else if (typeof hiddenUsers[i].username !== 'undefined' && hiddenUsers[i].username !== null && hiddenUsers[i].username.toLowerCase() === userName.toLowerCase()) {
            return true;
        }
    }

    return false;
}

function isCategoryHidden(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    for (var i = 0; i < hiddenCategories.length; i++) {
        if (typeof hiddenCategories[i].longname !== 'undefined' && hiddenCategories[i].longname !== null && hiddenCategories[i].longname.toLowerCase() === category.toLowerCase()) {
            return true;
        }
    }

    return false;
}

function getDeviationsByUser(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    if (isBrowse) {
        if (userID !== null) {
            return $('.browse-container').find('div.tt-a').filter(function() { return $(this).attr('userid') === userID; });
        } else if (userName !== null) {
            return $('.browse-container').find('div.tt-a').filter(function() { return $(this).attr('username').toLowerCase() === userName.toLowerCase(); });
        }
    } else if (isProfile) {
        if (userID !== null) {
            return $('#output').find('div#gmi-Gruser').filter(function() { return $(this).attr('gmi-id') === userID; });
        } else if (userName !== null) {
            return $('#output').find('div#gmi-Gruser').filter(function() { return $(this).attr('gmi-name').toLowerCase() === userName.toLowerCase(); });
        }
    }
}

function getDeviationsByCategory(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    if (isBrowse) {
        return $('.browse-container').find('div.tt-a').filter(function() { return $(this).attr('category').toLowerCase() === category.toLowerCase(); });
    }
}

function manuallyHideUser() {
    var userName = $('#manage-users-table input#username').val();
    if (userName === '' || userName.length === 0)
        userName = null;

    var userID = $('#manage-users-table input#userid').val();
    if (userID === '' || userID.length === 0)
        userID = null;

    hideUser(userID, userName);
    $('#manage-users-table').remove();

    var usersTable = buildFilteredUsersTable();
    $('#manage-users-tab-content').append(usersTable);
}

function hideUser(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    if (isUserHidden(userID, userName))
        return false;

    hiddenUsers.push({
        userid:     userID,
        username:   userName
    });

    GM_setValue('hiddenUsers', JSON.stringify(hiddenUsers));

    return hideDeviationsByUser(userID, userName);
}

function showUser(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    for (var i = 0; i < hiddenUsers.length; i++) {
        if (userID !== null && hiddenUsers[i].userid === userID) {
            hiddenUsers.splice(i, 1);
        } else if (userName !== null || hiddenUsers[i].username.toLowerCase() === userName.toLowerCase()) {
            hiddenUsers.splice(i, 1);
        }
    }

    GM_setValue('hiddenUsers', JSON.stringify(hiddenUsers));

    return showDeviationsByUser(userID, userName);
}

function hideDeviationsByUser(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    var deviations = getDeviationsByUser(userID, userName);

    if (isBrowse) {
        deviations.addClass('user-hidden').find('span.user-toggle-text').html('Show User\'s Deviations');
    } else if (isProfile) {
        container.addClass('user-hidden').find('a.user-toggle-button > span').html('Show User\'s Deviations');
    }

    return true;
}

function showDeviationsByUser(userID, userName) {
    userID = (typeof userID === 'undefined') ? null : userID;
    userName = (typeof userName === 'undefined') ? null : userName;
    if ((userID === null || userID === '') && (userName === null || userName === ''))
        return false;

    var deviations = getDeviationsByUser(userID, userName);

    if (isBrowse) {
        deviations.removeClass('user-hidden').find('span.user-toggle-text').html('Hide User\'s Deviations');
    } else if (isProfile) {
        container.removeClass('user-hidden').find('a.user-toggle-button > span').html('Hide User\'s Deviations');
    }

    return true;
}

function hideCategory(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    if (isCategoryHidden(category))
        return false;

    hiddenCategories.push({
        longname: category
    });

    GM_setValue('hiddenCategories', JSON.stringify(hiddenCategories));

    return hideDeviationsByCategory(category);
}

function showCategory(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    for (var i = 0; i < hiddenCategories.length; i++) {
        if (hiddenCategories[i].longname.toLowerCase() === category.toLowerCase()) {
            hiddenCategories.splice(i, 1);
        }
    }

    GM_setValue('hiddenCategories', JSON.stringify(hiddenCategories));

    return showDeviationsByCategory(category);
}

function hideDeviationsByCategory(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    var deviations = getDeviationsByCategory(category);
    deviations.addClass('category-hidden').find('span.category-toggle-text').html('Show Category\'s Deviations');

    return true;
}

function showDeviationsByCategory(category) {
    category = (typeof category === 'undefined') ? null : category;
    if (category === null || category === '')
        return false;

    var deviations = getDeviationsByCategory(category);
    deviations.removeClass('category-hidden').find('span.category-toggle-text').html('Hide Category\'s Deviations');

    return true;
}

function manageFilters() {
    var form = $('<form/>')
        .addClass('manage-filters-settings');

    var fieldset = $('<fieldset/>')
        .appendTo(form);

    var legend = $('<legend/>')
        .html('Settings')
        .appendTo(fieldset);

    var input = $('<input/>')
        .attr('type', 'checkbox')
        .attr('id', 'placeholders')
        .attr('name', 'placeholders')
        .attr('checked', GM_getValue('placeholders', true))
        .on('change', function() {
            GM_setValue('placeholders', !GM_getValue('placeholders', true));
            $('body').toggleClass('no-placeholders');
        })
        .appendTo(fieldset);

    var label = $('<label/>')
        .attr('for', input.attr('id'))
        .html(' Use placeholders for hidden deviations')
        .append('<br/><small>(Disabling this will hide deviations completely)</small>')
        .insertAfter(input);

    var toggleUsersTable = $('<a/>')
        .addClass('manage-filters-tab')
        .addClass('active')
        .html('Filtered Users')
        .on('click', function() {
            $(this).addClass('active')
            $(this).siblings('a.manage-filters-tab').removeClass('active')
            $('#manage-users-tab-content').removeClass('hidden');
            $('#manage-categories-tab-content').addClass('hidden');
        });

    var toggleCategoriesTable = $('<a/>')
        .addClass('manage-filters-tab')
        .html('Filtered Categories')
        .on('click', function() {
            $(this).addClass('active')
            $(this).siblings('a.manage-filters-tab').removeClass('active')
            $('#manage-users-tab-content').addClass('hidden');
            $('#manage-categories-tab-content').removeClass('hidden');
        });

    var tabs = $('<div>')
        .addClass('manage-filters-tabs')
        .append(toggleUsersTable)
        .append(toggleCategoriesTable);

    var usersTabContent = $('<div/>')
        .addClass('manage-filters-tab-content')
        .attr('id', 'manage-users-tab-content');

    var categoriesTabContent = $('<div/>')
        .addClass('manage-filters-tab-content')
        .attr('id', 'manage-categories-tab-content')
        .addClass('hidden');

    var usersTable = buildFilteredUsersTable()
        .appendTo(usersTabContent);

    var categoriesTable = buildFilteredCategoriesTable()
        .appendTo(categoriesTabContent);

//$('<pre/>').append(JSON.stringify(hiddenUsers, null, 4)).appendTo(usersTabContent);
//$('<pre/>').append(JSON.stringify(hiddenCategories, null, 4)).appendTo(categoriesTabContent);

    var content = $('<div/>')
        .append(form)
        .append(tabs)
        .append(usersTabContent)
        .append(categoriesTabContent)
        .daModal({title: 'Manage deviantArt Filters', width: '50%', height: '75%', footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" script by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'});
}

function buildFilteredUsersTable() {
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
        .on('click', manuallyHideUser)
        .wrap('<td/>').parent()
        .appendTo(userRow);

    usersTable.append(userRow);

    for (var i = 0; i < hiddenUsers.length; i++) {
        userRow = $('<tr/>');

        // username column/link
        if (typeof hiddenUsers[i].username !== 'undefined' && hiddenUsers[i].username !== null) {
            userRow.append('<td><a class="external" href="http://' + hiddenUsers[i].username + '.deviantart.com/" target="_blank">' + hiddenUsers[i].username + '</a></td>');
        } else {
            userRow.append('<td>---</td>');
        }

        // userid column
        if (typeof hiddenUsers[i].userid !== 'undefined' && hiddenUsers[i].userid !== null) {
            userRow.append('<td>' + hiddenUsers[i].userid + '</td>');
        } else {
            userRow.append('<td>---</td>');
        }

        // unhide user column/link
        var unhideUserLink = $('<button/>')
            .addClass('smbutton smbutton-green smbutton-shadow')
            .attr('userid', hiddenUsers[i].userid)
            .attr('username', hiddenUsers[i].username)
            .html('Unhide User')
            .on('click', function() {
                showUser($(this).attr('userid'), $(this).attr('username'));
                $(this).parents('tr').hide().remove();
            })
            .wrap('<td/>').parent()
            .appendTo(userRow);

        usersTable.append(userRow);
    }

    return usersTable;
}

function buildFilteredCategoriesTable() {
    var categoriesTable = $('<table/>')
        .addClass('manage-filters-table')
        .attr('id', 'manage-categories-table')
        .append('<tr><th>Category Name</th><th>Action</th></tr>');

    var categoryRow;

    for (var i = 0; i < hiddenCategories.length; i++) {
        categoryRow = $('<tr/>')

        // category name column/link
        categoryRow.append('<td><a class="external" href="http://www.deviantart.com/browse/all/' + hiddenCategories[i].longname + '" target="_blank">' + hiddenCategories[i].longname + '</a></td>');

        // unhide category column/link
        var unhideCategoryLink = $('<button/>')
            .addClass('smbutton smbutton-green smbutton-shadow')
            .attr('category', hiddenCategories[i].longname)
            .html('Unhide Category')
            .on('click', function() {
                showCategory($(this).attr('category'));
                $(this).parents('tr').hide().remove();
            })
            .wrap('<td/>').parent()
            .appendTo(categoryRow);

        categoriesTable.append(categoryRow);
    }

    return categoriesTable;
}

function getCSS() {
    var css = '';

    css += '.manage-filters-trigger { cursor: pointer; text-align: center; position: absolute; left: 150px; top: 2px; }';

    css += '.manage-filters-settings { margin-bottom: 1em !important; }';
    css += '.manage-filters-settings fieldset { border: 1px solid #8C9A88; }';
    css += '.manage-filters-settings legend { font: bold 1.333em Trebuchet MS, sans-serif; padding: 0 6px; }';
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

    // show/hide user's deviations button on a profile page
    css += '#gmi-Gruser a.user-toggle-button i.icon { background-position: -960px 0; }';
    css += '#gmi-Gruser.user-hidden a.user-toggle-button i.icon { background-position: -1720px 0; }';

    // hidden deviations on a browse page
    css += '.user-hidden .thumb, .category-hidden .thumb { background: #DDE6DA url("http://st.deviantart.net/misc/noentry-green.png") no-repeat center center !important; }';
    css += '.user-hidden .thumb > *, .category-hidden .thumb > * { visibility: hidden !important }';

    // fully remove hidden deviations on a browse page
    css += '.no-placeholders .user-hidden, .no-placeholders .category-hidden { display: none !important; }';

    // hide user's deviations on a profile page
    css += '.user-hidden #gruze-columns { display: none; }';
    css += '.user-hidden #deviant { background: url("http://st.deviantart.net/misc/noentry-green.png") no-repeat scroll center center !important; }';

    // insert the line breaks automatically before returning
    return css.replace(/}/g, "}\n");
}


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
                    padding:        '0 15px 15px',
                    height:         'calc(100% - 56px - 70px)', // 56px: header; 70px: footer (buttons)
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