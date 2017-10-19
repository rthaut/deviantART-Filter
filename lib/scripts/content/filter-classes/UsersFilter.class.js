import Filter from './Filter.class';
import StyleSheet from '../../../helpers/stylesheet';

import { PLACEHOLDER_CSS, PLACEHOLDER_TEXT_CSS } from '../../../helpers/constants';

const UsersFilter = (() => {

    const FILTER_ID = 'users';      // the "key" used for local storage
    const FILTER_NAME = 'Users';    // used for retrieving localized messages
    const PREV_KEY = 'hiddenUsers';

    const USER_REGEX = /^https?:\/\/([^\.]+)\.deviantart\.com/i;

    class UsersFilter extends Filter {

        constructor(id, name) {
            super(FILTER_ID, FILTER_NAME);

            this.styleSheet = StyleSheet.Create();
        }

        init() {
            console.log('[Content] UsersFilter.init()');

            super.init();

            const data = localStorage.getItem(PREV_KEY);
            if (data !== undefined && data !== null) {
                const items = JSON.parse(data);
                console.log('[Content] UsersFilter.init() :: Items', items);
                browser.runtime.sendMessage({
                    'action': 'migrate-filter',
                    'data': {
                        'filter': FILTER_ID,
                        'items': items
                    }
                }).then((response) => {
                    console.log('[Content] UsersFilter.init() :: Response', response);

                    if (!response.error) {
                        //localStorage.removeItem(PREV_KEY);
                    }
                });
            }
        }

        resetFilter() {
            console.log('[Content] UsersFilter.resetFilter()');

            StyleSheet.Reset(this.styleSheet);
        }

        updateFilter(filter) {
            console.log('[Content] UsersFilter.updateFilter()', filter);

            this.resetFilter();

            const invisible = 'display: none !important;';

            filter.data.forEach((item) => {
                const text = browser.i18n.getMessage('FilterTypeUsersPlaceholderText', [item.username]);

                // common (placeholders vs. no placeholders) selectors for various DOM structures for thumbs
                const selectors = [
                    `.torpedo-container .thumb[href*="//${item.username}.deviantart.com"]`,             // browse (thumb wall)
                    `a.full-view-link[href*="${item.username}.deviantart.com"]`,                        // browse (full view)
                    `.thumb a:not(.torpedo-thumb-link)[href*="//${item.username}.deviantart.com"]`,     // deviation sidebar
                    `*[data-embed-format="thumb"] .thumb[href*="//${item.username}.deviantart.com"]`    // comments, journals
                ];

                //TODO: the next 3 statements are currently the same for all CSS-based filters...
                //      maybe there should be a shared function that takes the selectors and the placeholder text?

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.no-placeholders ${selector}`).join(', ') + ` { ${invisible} }`);

                // show the placeholder image over the thumb image when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::before`).join(', ') + ` { ${PLACEHOLDER_CSS} }`);

                //TODO: the last 2 selectors don't actually need the following placeholder text CSS rule...
                //      maybe they should be declared separately and have only the first 2 CSS rules applied

                // show the placeholder text over the thumb (browse resuls page only) when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::after`).join(', ') + ` { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);
            });
        }

        updateThumbs(thumbs) {
            console.log('[Content] UsersFilter.updateFilter()', thumbs);

            if (!thumbs.length) {
                return false;
            }

            thumbs.forEach((thumb) => {
                thumb.addEventListener('mouseover', (event) => {
                    const link = thumb.querySelector('a');
                    if (link !== undefined && link !== null) {
                        let control = link.querySelector('span.hide-user-corner');
                        if (!control || control == null) {
                            const match = USER_REGEX.exec(link.href);
                            control = document.createElement('span');
                            control.classList.add('hide-user-corner');
                            control.setAttribute('username', match[1]);
                            control.addEventListener('click', this.toggleUserDeviationClickHandler);
                            link.appendChild(control);
                        }
                    }
                });
            });
        }

        toggleUserDeviationClickHandler(event) {
            console.log('[Content] UsersFilter.toggleUserDeviationClickHandler()', event);

            event.preventDefault();
            event.stopPropagation();

            browser.runtime.sendMessage({
                'action': 'add-filter-item',
                'data': {
                    'filter': 'users',
                    'item': {
                        'username': event.target.getAttribute('username')
                    }
                }
            });
        }
    }

    return UsersFilter;

})();

export default UsersFilter;
