import Metadata from './metadata';
import UsersFilter from './filter-classes/UsersFilter.class';
import TagsFilter from './filter-classes/TagsFilter.class';
import CategoriesFilter from './filter-classes/CategoriesFilter.class';
import StyleSheet from '../../helpers/stylesheet';

Metadata.init();

const PlaceholderVarsStyleSheet = StyleSheet.Create();
setPlaceholderCSSVariables(PlaceholderVarsStyleSheet);

const AVAILABLE_FILTERS = [
    new UsersFilter(),
    new TagsFilter(),
    new CategoriesFilter()
];

AVAILABLE_FILTERS.forEach((filter) => {
    filter.init();
});

browser.runtime.onMessage.addListener((message) => {
    console.log('[Content] browser.runtime.onMessage', message);

    if (message.action !== undefined) {
        switch (message.action) {
            case 'toggle-placeholders':
                togglePlaceholders(message.data.placeholders);
                break;

            case 'placeholder-styles-changed':
                setPlaceholderCSSVariables(PlaceholderVarsStyleSheet);
                break;
        }
    }

    return true;
});

browser.storage.sync.get('placeholders').then(({ placeholders }) => {
    togglePlaceholders(placeholders);
});

browser.runtime.sendMessage({ 'action': 'content-script-loaded' });


/**
 * Toggles the display of placeholders for filtered thumbnails
 * @param {boolean} active indicates whether or not placeholders should be active/enabled
 */
function togglePlaceholders(active) {
    document.querySelector('body').classList.toggle('placeholders', active);
    document.querySelector('body').classList.toggle('no-placeholders', !active);
}

/**
 * Sets the CSS variables for the placeholders
 */
async function setPlaceholderCSSVariables(stylesheet) {
    console.log('[Content] CSSFilter.setVariables()');

    StyleSheet.Reset(stylesheet);

    const vars = await browser.storage.sync.get({
        'placeholderBGColor': '#DDE6DA',
        'placeholderLogoColor': '#B4C0B0',
        'placeholderTextColor': '#B4C0B0'
    });

    stylesheet.insertRule(`:root {
        --placeholder-bg-color: ${vars.placeholderBGColor};
        --placeholder-logo-color: ${vars.placeholderLogoColor};
        --placeholder-text-color: ${vars.placeholderTextColor};
    }`);
}

/**
 * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes on the Browse Results page
 */
function watchForNewThumbs() {
    console.log('[Content] watchForNewThumbs()');

    const browse = document.querySelector('#browse-results');
    if (browse !== undefined && browse !== null) {
        //TODO: handle other DOM structures (like the "Full View" browse mode and galleries/folders)
        const target = browse.querySelector('.results-page-thumb');

        if (target !== undefined && target !== null) {

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes !== null) {
                        const newThumbs = [];
                        for (const node of mutation.addedNodes) {
                            if ((node.tagName.toLowerCase() === 'span') && (node.className.split(' ').indexOf('thumb') !== -1)) {
                                newThumbs.push(node);
                            }
                        }

                        Metadata.handleThumbs(newThumbs);

                        AVAILABLE_FILTERS.forEach((filter) => {
                            filter.handleThumbs(newThumbs);
                        });
                    }
                });
            });

            observer.observe(target, { 'childList': true, 'subtree': true });
        }
    }
}
watchForNewThumbs();
