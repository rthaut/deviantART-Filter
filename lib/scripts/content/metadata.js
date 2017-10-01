const Metadata = (() => {

    class Metadata {

        addMessageListener() {
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
                const thumb = document.querySelector(`a.torpedo-thumb-link[href*="${meta.url}"]`);
                if (thumb !== undefined && thumb !== null) {
                    console.log(thumb);

                    if (meta.id) {
                        thumb.setAttribute('data-deviation-uuid', meta.id);
                    }

                    if (meta.category) {
                        thumb.setAttribute('data-category', meta.category);
                    }

                    if (meta.category_path) {
                        thumb.setAttribute('data-category-path', meta.category_path);
                    }

                    if (meta.tags.length) {
                        let tags = thumb.getAttribute('data-tags');
                        if (tags !== undefined && tags !== null && tags !== '') {
                            tags = tags.split(',');
                            tags.concat(meta.tags.join(','));
                            tags.filter((value, index) => tags.indexOf(value) === index);
                        } else {
                            tags = meta.tags.join(',');
                        }
                        thumb.setAttribute('data-tags', tags);
                    }
                }
            });
        }

    }

    return new Metadata();

})();

export default Metadata;
