const Users = (() => {

    class Users {

        insertUsersFilterDOMControls() {
            console.log('Content Script [Users] :: insertUsersFilterDOMControls()');

            //@TODO need a mutation observer to watch for the insertion of new "pages" and add the event listeners for each new element

            document.querySelectorAll('span.thumb').forEach((thumb) => {
                thumb.addEventListener('mouseover', (event) => {
                    let link = thumb.querySelector('a.torpedo-thumb-link');
                    let control = link.querySelector('span.hide-user-corner');
                    if (!control || control == null) {
                        let regex = /^https?:\/\/([^\.]+)\.deviantart\.com/i;
                        let match = regex.exec(link.href);
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
            console.log('Content Script [Users] :: toggleUserDeviationClickHandler()', event);
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

    return new Users();

})();

export default Users;
