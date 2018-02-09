const Metadata = (() => {

    const Metadata = {

        /**
         *
         */
        'init': function () {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));
        },

        /**
         *
         */
        'onMessage': function (message) {
            console.log('[Content] Metadata.onMessage()', message);

            switch (message.action) {
                case 'set-metadata':
                    this.setMetadataOnDeviations(message.data.metadata);
                    break;
            }

            return true;
        },

        /**
         *
         */
        'setMetadataOnDeviations': function (metadata) {
            console.log('[Content] Metadata.setMetadataOnDeviations()', metadata);

            metadata.forEach((meta) => {
                const link = document.querySelector(`a[href*="${meta.url}"]`);

                if (link !== undefined && link !== null) {
                    const thumb = link.parentElement;
                    const target = (thumb !== undefined && thumb !== null) ? thumb : link;

                    if (meta.id) {
                        target.setAttribute('data-deviation-uuid', meta.id);
                    }

                    if (meta.category) {
                        target.setAttribute('data-category', meta.category);
                    }

                    if (meta.category_path) {
                        target.setAttribute('data-category-path', meta.category_path);
                    }

                    if (meta.tags && meta.tags.length) {
                        target.setAttribute('data-tags', meta.tags.join(' '));
                    }
                }
            });
        }

    };

    return Metadata;

})();

export default Metadata;
