"use strict";

browser.runtime.sendMessage({ 'action': 'content-script-load' }).then((response) => {
    document.querySelector('body').classList.add(response.config.placeholders ? 'placeholders' : 'no-placeholders');
});

browser.runtime.onMessage.addListener((request) => {
    console.log(request);

    switch (request) {
        case 'show-management-modal':
            $('#ManagementPanel').daModal({
                title: 'Manage deviantART Filters',
                width: '75%',
                height: '75%',
                footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'
            });
            break;

        case 'toggle-placeholders':
            document.querySelector('body').classList.toggle('placeholders');
            document.querySelector('body').classList.toggle('no-placeholders');
            break;
    }

    return true;
});

// insert the new DOM elements, including all angular directives
if (!document.querySelector('#ManagementPanel')) {
    var modal = document.createElement('management-panel');
    modal.id = 'ManagementPanel';
    document.querySelector('body').appendChild(modal);
}

// bootstrap the angular app
var app = angular.module('deviantArtFilter', [
    'deviantArtFilter.components.ManagementPanel',
]);
angular.bootstrap(document, ['deviantArtFilter']);
