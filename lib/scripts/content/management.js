const Management = (() => {

    class Management {

        initManagementModal() {
            console.log('Content Script [Management] :: initManagementModal()');

            // insert the new DOM elements, including all angular directives
            if (!document.querySelector('#ManagementPanel')) {
                const modal = document.createElement('management-panel');
                modal.id = 'ManagementPanel';
                document.querySelector('body').appendChild(modal);
            }

            // bootstrap the angular app
            angular.module('deviantArtFilter', [
                'deviantArtFilter.components.ManagementPanel',
            ]);
            angular.bootstrap(document, ['deviantArtFilter']);
        }

        showManagementModal() {
            console.log('Content Script [Management] :: showManagementModal()');

            this.initManagementModal();
            $('#ManagementPanel').daModal({
                'title': 'Manage DeviantArt Filters',
                'width': '75%',
                'height': '75%',
                'footnote': '"<a href="http://fav.me/d6uocct">DeviantArt Filter</a>" by <a href="http://rthaut.deviantart.com/">rthaut</a>, <a href="http://lassekongo83.deviantart.com/journal/DeviantCrap-Filter-410429292">idea</a> from <a href="http://lassekongo83.deviantart.com/">lassekongo83</a>'
            });
        }
    }

    return new Management();

})();

export default Management;
