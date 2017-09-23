import Filters from './filters';

const ContentScript = (() => {

    class ContentScript {

        /**
         *
         * @param {tab} tab - the tab that loaded the content script
         */
        onContentScriptLoad(tab) {
            console.log('[Background] ContentScript.onContentScriptLoad()', tab);

            Filters.applyAllFiltersToTab(tab);

            return browser.storage.sync.get('placeholders').then((res) => {
                return {
                    'config': res
                }
            });
        }

    }

    return new ContentScript();

})();

export default ContentScript;
