"use strict";

browser.runtime.sendMessage({ 'action': 'init' }).then((response) => {
    console.log(response);
});

browser.runtime.onMessage.addListener((request) => {
    console.log(request);

    switch (request) {
        case 'show-management-modal':
            $('#deviantArtFilterModal').daModal({
                title: 'Manage deviantART Filters',
                width: '75%',
                height: '75%',
                footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'
            });
            break;
    }

    return true;
});

// insert the new DOM elements, including all angular directives
if (!document.querySelector('#deviantArtFilterModal')) {
    var modal = document.createElement('content-modal');
    modal.id = 'deviantArtFilterModal';
    document.querySelector('body').appendChild(modal);
}

// bootstrap the angular app
var app = angular.module('deviantArtFilter', [
    'deviantArtFilter.components.ContentModal',
    'deviantArtFilter.components.FilterPanel',
    'deviantArtFilter.components.OptionsPanel'
]);
angular.bootstrap(document, ['deviantArtFilter']);
