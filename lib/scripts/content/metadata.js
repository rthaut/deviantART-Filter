const Metadata = (() => {

    class Metadata {

        init() {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));
        }

        onMessage(request, sender, sendResponse) {
            console.log('[Content] Metadata.onMessage()', request, sender, sendResponse);

            switch (request.action) {
                case 'set-metadata':
                    this.setMetadataOnDeviations(request.data.metadata);
                    break;
            }

            return true;
        }

        setMetadataOnDeviations(metadata) {
            console.log('[Content] Metadata.setMetadataOnDeviations()', metadata);

            metadata.forEach((meta) => {
                const link = document.querySelector(`a.torpedo-thumb-link[href*="${meta.url}"]`);

                //TODO: should the metadata attributes be applied to the actual thumb container instead?
                //const thumb = link.parentElement;

                if (link !== undefined && link !== null) {
                    if (meta.id) {
                        link.setAttribute('data-deviation-uuid', meta.id);
                    }

                    if (meta.category) {
                        link.setAttribute('data-category', meta.category);
                    }

                    if (meta.category_path) {
                        link.setAttribute('data-category-path', meta.category_path);
                    }

                    if (meta.tags && meta.tags.length) {
                        link.setAttribute('data-tags', meta.tags.join(' '));
                    }
                }
            });
        }

    }

    return new Metadata();

})();

export default Metadata;
