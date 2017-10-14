import Management from './management.js';
import Metadata from './metadata.js';
import UsersFilter from './filter-classes/UsersFilter.class.js';
import TagsFilter from './filter-classes/TagsFilter.class.js';
import CategoriesFilter from './filter-classes/CategoriesFilter.class.js';

Metadata.init();

const AVIALABLE_FILTERS = [
    new UsersFilter(),
    new TagsFilter(),
    new CategoriesFilter()
];

AVIALABLE_FILTERS.forEach((filter) => {
    filter.init();
});

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
