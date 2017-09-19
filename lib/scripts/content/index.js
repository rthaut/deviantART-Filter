browser.runtime.sendMessage({ 'action': 'content-script-load' }).then((response) => {
    document.querySelector('body').classList.add(response.config.placeholders ? 'placeholders' : 'no-placeholders');
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
        case 'show-management-modal':
            showManagementModal();
            break;

        case 'toggle-placeholders':
            document.querySelector('body').classList.toggle('placeholders');
            document.querySelector('body').classList.toggle('no-placeholders');
            break;
    }

    return true;
});

function initManagementModal() {
    // insert the new DOM elements, including all angular directives
    if (!document.querySelector('#ManagementPanel')) {
        var modal = document.createElement('management-panel');
        modal.id = 'ManagementPanel';
        document.querySelector('body').appendChild(modal);
    }

    // bootstrap the angular app
    angular.module('deviantArtFilter', [
        'deviantArtFilter.components.ManagementPanel',
    ]);
    angular.bootstrap(document, ['deviantArtFilter']);
}

function showManagementModal() {
    initManagementModal();
    $('#ManagementPanel').daModal({
        title: 'Manage deviantART Filters',
        width: '75%',
        height: '75%',
        footnote: '"<a href="http://fav.me/d6uocct">deviantART Filter</a>" by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'
    });
}

function insertUsersFilterDOMControls() {
    //@TODO re-write this in plain JS (no jQuery)
    //      the event starts on .torpedo-container because that is the element that additional pages are injected into
    //      BUT the mouseover event is actually captured on span.thumb elements
    $('.torpedo-container').on('mouseover', 'span.thumb', function () {
        var regex = /^https?:\/\/([^\.]+)\.deviantart\.com/i;
        var match;

        var thumb = $(this);
        var control = $('span.hide-user-corner', thumb);
        if (!control || !control.length) {
            match = regex.exec(thumb.attr('href'));
            control = $('<span/>').addClass('hide-user-corner');
            control.attr('username', match[1]);
            control.on('click', $.proxy(toggleUserDeviationClickHandler, this));
            thumb.find('a.torpedo-thumb-link').append(control);
        }
    });
}
insertUsersFilterDOMControls();

function toggleUserDeviationClickHandler(event) {
    console.log('Content Script :: toggleUserDeviationClickHandler()', event);
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
