const Filter = (() => {

    class Filter {

        /**
         * Filter constructor
         * @param {string} id - The unique identified for the filter (used as the "key" used for local storage)
         * @param {string} name - The internal "name" (NOT translated) of the filter (used for retrieving localized messages)
         */
        constructor(id, name) {
            console.log('[Content] Filter Constructor', id, name);

            this.id = id;
            this.name = name;
        }

        /**
         * Initializes the filter
         */
        init() {
            console.log(`[Content] Filter('${this.name}').init()`);

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            this.handleThumbs(document.querySelectorAll('span.thumb'));

            this.watchForNewThumbs();
        }

        /**
         * Event listener for browser runtime messages
         * @param {object} message - The message
         * @param {runtime.MessageSender} sender - The sender of the message
         * @param {function} sendResponse - Function to call to send a response to the message
         */
        onMessage(message, sender, sendResponse) {
            console.log(`[Content] Filter('${this.name}').onMessage()`, message, sender, sendResponse);

            switch (message.action) {
                case 'update-filter':
                    if (message.data.filter.id === this.id) {
                        this.updateFilter(message.data.filter);
                    }
                    break;
            }

            return true;
        }

        /**
         * Run whenever the filter data is updated
         * @param {object} filter - The filter that was updated
         */
        updateFilter(filter) {
            console.log(`[Content] Filter('${this.name}').updateFilter()`, filter);
        }

        /**
         * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes on the Browse Results page
         */
        watchForNewThumbs() {
            console.log(`[Content] Filter('${this.name}').watchForNewThumbs()`);

            const browse = document.querySelector('#browse-results');
            if (browse !== undefined && browse !== null) {
                const target = browse.querySelector('.results-page-thumb'); //TODO: handle the "full view" browse mode

                if (target !== undefined && target !== null) {

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
        }

        /**
         * Filters and/or modifies the provided thumb DOM nodes
         * @param {Node[]} thumbs - The thumbs to filter and/or modify
         */
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

        /**
         * Filters the provided thumb DOM nodes
         * @param {Node[]} thumbs - The thumbs to filter
         */
        filterThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').filterThumbs()`, thumbs);
        }

        /**
         * Modifies the provided thumb DOM nodes
         * @param {Node[]} thumbs - The thumbs to modify
         */
        updateThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').updateThumbs()`, thumbs);
        }
    }

    return Filter;

})();

export default Filter;
