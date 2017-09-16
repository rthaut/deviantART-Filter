

/**
 *
 * @param {tab} tab - the tab that loaded the content script
 */
/* global applyFilterCSSToTab */
/* exported contentScriptLoad */
function contentScriptLoad(tab) {
    console.log('contentScriptLoad()', tab);

    var data = {
        'config': {},
        'filters': {}
    };

    applyFilterCSSToTab('users', tab)

    return browser.storage.sync.get('placeholders').then((res) => {
        console.log(res);
        data.config = res;

        return data;
    });
}
