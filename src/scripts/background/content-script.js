import Filters from './filters';

const ContentScript = (() => {

    const ContentScript = {

        /**
         * Triggers additional logic when the content script has finished loading
         * @param {tab} tab the tab that loaded the content script
         */
        'onContentScriptLoaded': function (tab) {
            console.log('[Background] ContentScript.onContentScriptLoad()', tab);

            Filters.sendFilterDataToTab(tab);
        },

        /**
         * Manually executes the content script on the specified tab
         * @param {tab} tab the tab to execute the content script on
         */
        'loadContentScript': function (tab) {
            console.log('[Background] ContentScript.loadContentScript()', tab);

            return browser.tabs.executeScript(tab.id, {
                'file': 'scripts/content.js',
                'runAt': 'document_end'
            });
        }

    };

    return ContentScript;

})();

export default ContentScript;
