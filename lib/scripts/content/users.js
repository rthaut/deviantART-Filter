const Users = (() => {

    const USER_REGEX = /^https?:\/\/([^\.]+)\.deviantart\.com/i;

    class Users {

        insertUsersFilterDOMControls() {
            console.log('[Content] Users.insertUsersFilterDOMControls()');

            const thumbs = document.querySelectorAll('span.thumb');
            this.attachThumbEventListeners(thumbs);
            this.watchForNewThumbs();
        }

        attachThumbEventListeners(thumbs) {
            console.log('[Content] Users.attachThumbEventListeners()', thumbs);
            thumbs.forEach((thumb) => {
                thumb.addEventListener('mouseover', (event) => {
                    const link = thumb.querySelector('a.torpedo-thumb-link');
                    let control = link.querySelector('span.hide-user-corner');
                    if (!control || control == null) {
                        const match = USER_REGEX.exec(link.href);
                        control = document.createElement('span');
                        control.classList.add('hide-user-corner');
                        control.setAttribute('username', match[1]);
                        control.addEventListener('click', this.toggleUserDeviationClickHandler);
                        link.appendChild(control);
                    }
                });
            });
        }

        toggleUserDeviationClickHandler(event) {
            console.log('[Content] Users.toggleUserDeviationClickHandler()', event);
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

        watchForNewThumbs() {
            console.log('[Content] Users.watchForNewThumbs()');
            const target = document.querySelector('#browse-results').querySelector('.results-page-thumb');

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes !== null) {
                        const thumbs = [];
                        for (const node of mutation.addedNodes) {
                            if ((node.tagName.toLowerCase() === 'span') && (node.className.split(' ').indexOf('thumb') !== -1)) {
                                thumbs.push(node);
                            }
                        }
                        if (thumbs.length) {
                            this.attachThumbEventListeners(thumbs);
                        }
                    }
                });
            });

            observer.observe(target, { 'childList': true, 'subtree': true });
        }
    }

    return new Users();

})();

export default Users;
