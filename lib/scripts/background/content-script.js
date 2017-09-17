/**
 *
 * @param {tab} tab - the tab that loaded the content script
 */
/* global getAvailableFilters addFilterCSSToTab insertDOMControls */
/* exported contentScriptLoad */
function contentScriptLoad(tab) {
    console.log('contentScriptLoad()', tab);

    let filters = getAvailableFilters();
    filters.forEach(function (filter) {
        addFilterCSSToTab(filter, tab);
        //insertDOMControls(filter, tab);
    }, this);

    return browser.storage.sync.get('placeholders').then((res) => {
        return {
            'config': res
        }
    });
}
