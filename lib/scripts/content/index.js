import Management from './management.js';
import Users from './users.js';
import Metadata from './metadata.js';

Users.insertUsersFilterDOMControls();
Metadata.addMessageListener();

browser.runtime.sendMessage({ 'action': 'content-script-load' }).then((response) => {
    document.querySelector('body').classList.add(response.config.placeholders ? 'placeholders' : 'no-placeholders');
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content Script :: browser.runtime.onMessage', request, sender, sendResponse);
    switch (request) {
        case 'show-management-modal':
            Management.showManagementModal();
            break;

        case 'toggle-placeholders':
            document.querySelector('body').classList.toggle('placeholders');
            document.querySelector('body').classList.toggle('no-placeholders');
            break;
    }

    return true;
});
