/**
 *
 */
/* exported getFilters */
function getFilters() {
    console.log('getFilters()');
    return new Promise((resolve, reject) => {
        resolve({
            'filters': [
                {
                    'id': 'users',
                    'name': {
                        'singular': browser.i18n.getMessage('FilterTypeUsersName'),
                        'plural': browser.i18n.getMessage('FilterTypeUsersNamePlural')
                    },
                    'total': 3,
                    'properties': ['Username'],
                    'labels': {
                        'none': browser.i18n.getMessage('FilterTypeUsersLabelNone'),
                        'help': browser.i18n.getMessage('FilterTypeUsersLabelHelp')
                    }
                },
                {
                    'id': 'tags',
                    'name': {
                        'singular': browser.i18n.getMessage('FilterTypeTagsName'),
                        'plural': browser.i18n.getMessage('FilterTypeTagsNamePlural')
                    },
                    'total': 3,
                    'properties': ['Tag'],
                    'labels': {
                        'none': browser.i18n.getMessage('FilterTypeTagsLabelNone'),
                        'help': browser.i18n.getMessage('FilterTypeTagsLabelHelp')
                    }
                }
            ]
        });
    });
}

/**
 *
 * @param {string} filter - the unique identified of the filter
 */
/* exported getFilterData */
function getFilterData(filter) {
    console.log('getFilterData()');
    return new Promise((resolve, reject) => {
        var data = [];
        switch (filter) {
            case 'users':
                data.push({ 'username': 'test1' });
                data.push({ 'username': 'test2' });
                data.push({ 'username': 'test3' });
                break;

            case 'tags':
                data.push({ 'tag': 'manip' });
                data.push({ 'tag': 'painting' });
                data.push({ 'tag': 'deviant' });
                break;
        }
        setTimeout(() => {
            resolve({ 'data': data });
        }, 3000);
    });
}

/**
 *
 * @param {*} filter
 * @param {*} item
 */
/* exported addFilterItem */
function addFilterItem(filter, item) {
    console.log('addFilterItem', filter, item);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
            //reject(new Error('Item was already in filter list'));
        }, 1000);
    });
}

/**
 *
 * @param {*} filter
 * @param {*} item
 */
/* exported removeFilterItem */
function removeFilterItem(filter, item) {
    console.log('removeFilterItem', filter, item);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
            //reject(new Error('Item was not found in filter list'));
        }, 1000);
    });
}

/**
 *
 * @param {*} filter
 * @param {tab} tab - the tab to which the filter's CSS should be applied
 */
/* exported applyFilterCSSToTab */
function applyFilterCSSToTab(filter, tab) {
    console.log('applyFilterCSSToTab()', filter, tab);
    return new Promise((resolve, reject) => {
        var css = '';

        var selector = '.torpedo-container .thumb';
        var invisibleCSS = 'display: none !important;';
        var placeholderCSS = `position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url(${browser.extension.getURL('icons/logo-muted.svg')}) no-repeat center;`;

        var username = 'raichiyo33';

        css += `body.no-placeholders ${selector}[href*="//${username}.deviantart.com"] { ${invisibleCSS} }`;
        css += `body.placeholders ${selector} a.torpedo-thumb-link[href*="//${username}.deviantart.com"]::before { ${placeholderCSS} }`;

        resolve(css);
    }).then((css) => {
        console.log(css);
        return browser.tabs.insertCSS(tab.id, {
            'code': css,
            'cssOrigin': 'author',
            'runAt': 'document_start'
        });
    }).catch((error) => {
        console.error(error);
    });
}
