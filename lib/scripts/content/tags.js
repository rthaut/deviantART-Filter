const Tags = (() => {

    class Tags {

        addMessageListener() {
            browser.runtime.onMessage.addListener(this.onMessage.bind(this));
        }

        onMessage(request, sender, sendResponse) {
            console.log('[Content] Tags.onMessage()', request, sender, sendResponse);
            switch (request.action) {
                case 'set-tags':
                    this.setTagsOnDeviations(request.data.tags);
                    break;
            }

            return true;
        }

        setTagsOnDeviations(tags) {
            console.log('[Content] Tags.setTagsOnDeviations()', tags);

            tags.forEach((tag) => {
                if (tag.tags.length) {
                    const thumb = document.querySelector(`a.torpedo-thumb-link[href*="${tag.url}"]`);
                    if (thumb !== undefined && thumb !== null) {
                        console.log(thumb);
                        thumb.setAttribute('data-tags', tag.tags.join(','));
                    }
                }
            });
        }

    }

    return new Tags();

})();

export default Tags;
