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

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(`body.no-placeholders .thumb[href*="//${item.username}.deviantart.com"] { ${invisible} }`);

                // show the placeholder image over the thumb's link when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[href*="//${item.username}.deviantart.com"] a::before { ${PLACEHOLDER_CSS} }`);

                // show the placeholder text over the thumb's link (fancy thumbs only) when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[href*="//${item.username}.deviantart.com"] a.torpedo-thumb-link::after { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[href*="//${item.username}.deviantart.com"] a.torpedo-thumb-link + span.info { ${invisible} }`);
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
                'action': 'toggle-filter-item',
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
