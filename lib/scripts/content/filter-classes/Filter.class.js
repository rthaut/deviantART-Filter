const Filter = (() => {

    class Filter {

        constructor(id, name) {
            console.log('[Content] Filter Constructor', id, name);

            this.id = id;
            this.name = name;
        }

        init() {
            console.log(`[Content] Filter('${this.name}').init()`);

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            this.handleThumbs(document.querySelectorAll('span.thumb'));

            this.watchForNewThumbs();
        }

        onMessage(request, sender, sendResponse) {
            console.log(`[Content] Filter('${this.name}').onMessage()`, request, sender, sendResponse);

            switch (request.action) {
                case 'update-filter':
                    if (request.data.filter.id === this.id) {
                        this.updateFilter(request.data.filter);
                    }
                    break;
            }

            return true;
        }

        handleThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').handleThumbs()`, thumbs);

            if (!thumbs.length) {
                return false;
            }

            try {
                this.filterThumbs(thumbs);
                this.updateThumbs(thumbs);
            } catch (error) {
                console.error(error);
            }
        }

        filterThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').filterThumbs()`, thumbs);
        }

        watchForNewThumbs() {
            console.log(`[Content] Filter('${this.name}').watchForNewThumbs()`);

            const browse = document.querySelector('#browse-results');
            if (browse !== undefined && browse !== null) {
                const target = browse.querySelector('.results-page-thumb');

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes !== null) {
                            const thumbs = [];
                            for (const node of mutation.addedNodes) {
                                if ((node.tagName.toLowerCase() === 'span') && (node.className.split(' ').indexOf('thumb') !== -1)) {
                                    thumbs.push(node);
                                }
                            }

                            this.handleThumbs(thumbs);
                        }
                    });
                });

                observer.observe(target, { 'childList': true, 'subtree': true });
            }
        }

        updateFilter(filter) {
            console.log(`[Content] Filter('${this.name}').updateFilter()`, filter);
        }

        updateThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').updateThumbs()`, thumbs);
        }
    }

    return Filter;

})();

export default Filter;
