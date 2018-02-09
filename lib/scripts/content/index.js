import Management from './management';
import Metadata from './metadata';
import UsersFilter from './filter-classes/UsersFilter.class';
import TagsFilter from './filter-classes/TagsFilter.class';
import CategoriesFilter from './filter-classes/CategoriesFilter.class';

Metadata.init();

const AVIALABLE_FILTERS = [
    new UsersFilter(),
    new TagsFilter(),
    new CategoriesFilter()
];

AVIALABLE_FILTERS.forEach((filter) => {
    filter.init();
});

browser.runtime.onMessage.addListener((message) => {
    console.log('Content Script :: browser.runtime.onMessage', message);

    switch (message.action) {
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

browser.storage.sync.get('placeholders').then(({ placeholders }) => {
    document.querySelector('body').classList.add(placeholders ? 'placeholders' : 'no-placeholders');
});

browser.runtime.sendMessage({ 'action': 'content-script-load' });
