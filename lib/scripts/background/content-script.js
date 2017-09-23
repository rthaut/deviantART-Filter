import Filters from './filters';

const ContentScript = (() => {

    class ContentScript {

        /**
         *
         * @param {tab} tab - the tab that loaded the content script
         */
        onContentScriptLoad(tab) {
            console.log('[Background] ContentScript.onContentScriptLoad()', tab);

            return browser.storage.sync.get('placeholders').then((res) => {
                return {
                    'config': res
                }
            });
        }

        loadContentScript(tab) {
            console.log('[Background] ContentScript.loadContentScript()', tab);

            return browser.tabs.executeScript(tab.id, {
                'file': 'scripts/content.js',
                'runAt': 'document_end'
            });
        }

    }

    return new ContentScript();

})();

export default ContentScript;
