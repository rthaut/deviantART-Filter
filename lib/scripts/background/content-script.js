/**
 *
 * @param {tab} tab - the tab that loaded the content script
 */
/* global getAvailableFilters getFilterData addCSSToTab */
/* exported contentScriptLoad */
function contentScriptLoad(tab) {
    console.log('contentScriptLoad()', tab);

    let filters = getAvailableFilters();
    filters.forEach((filter) => {
        filter.getFilterData().then((data) => {
            data.forEach((item) => {
                addCSSToTab(filter.getCSS(item), tab);
            }, this);
        });
    }, this);

    return browser.storage.sync.get('placeholders').then((res) => {
        return {
            'config': res
        }
    });
}
