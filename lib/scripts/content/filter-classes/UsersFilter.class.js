import Filter from './Filter.class.js';
import StyleSheet from '../../../helpers/stylesheet.js';

const UsersFilter = (() => {

    const FILTER_ID = 'users';      // the "key" used for local storage
    const FILTER_NAME = 'Users';    // used for retrieving localized messages

    const USER_REGEX = /^https?:\/\/([^\.]+)\.deviantart\.com/i;

    class UsersFilter extends Filter {

        constructor(id, name) {
            super(FILTER_ID, FILTER_NAME);

            this.styleSheet = StyleSheet.Create();
        }

        resetFilter() {
            console.log('[Content] UsersFilter.resetFilter()');

            StyleSheet.Reset(this.styleSheet);
        }

        updateFilter(filter) {
            console.log('[Content] UsersFilter.updateFilter()', filter);

            this.resetFilter();

            //@TODO these constants are (currently) shared between Tags and Users filters...
            //      Maybe declare them on the base Filter class instead?
            //      Or make a new CSS Filter class for them to extend?

            const selector = '.torpedo-container .thumb';
            const invisible = 'display: none !important;';

            const placeholder = [
                'z-index: 5;',
                'position: absolute;',
                'top: 0;',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: 100%;',
                'content: "";',
                `background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`
            ].join('\n');

            const placeholder_text = [
                'z-index: 6;',
                'position: absolute;',
                'top: calc(50% + 64px);',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: calc(100% - calc(50% + 64px));',
                'text-align: center;',
                'color: #B4C0B0;',
                'font-weight: bold;',
                'line-height: 0.9em'
            ].join('\n');

            filter.data.forEach((item) => {
                const text = browser.i18n.getMessage('FilterTypeUsersPlaceholderText', item.username);

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(`body.no-placeholders ${selector}[href*="//${item.username}.deviantart.com"] { ${invisible} }`);

                // show the placeholder image and text over the link of thumbs when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[href*="//${item.username}.deviantart.com"]::before { ${placeholder} }`);
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[href*="//${item.username}.deviantart.com"]::after { content: "${text}"; ${placeholder_text} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[href*="//${item.username}.deviantart.com"] + span.info { ${invisible} }`);
            });
        }

        updateThumbs(thumbs) {
            console.log('[Content] UsersFilter.updateFilter()', thumbs);

            if (!thumbs.length) {
                return false;
            }

            thumbs.forEach((thumb) => {
                thumb.addEventListener('mouseover', (event) => {
                    const link = thumb.querySelector('a.torpedo-thumb-link');
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
            }).then((response) => {
                if (response) {
                    // user successfully filtered
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                //@TODO what to do on error?
            }).then(() => {
                //@TODO anything to do at the end?
            });
        }
    }

    return UsersFilter;

})();

export default UsersFilter;
