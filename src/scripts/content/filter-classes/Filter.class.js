const Filter = (() => {

    class Filter {

        /**
         * Filter constructor
         * @param {string} id The unique identified for the filter (used as the "key" used for local storage)
         * @param {string} name The internal "name" (NOT translated) of the filter (used for retrieving localized messages)
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
        }

        /**
         * Event listener for browser runtime messages
         * @param {object} message The message
         * @param {runtime.MessageSender} sender The sender of the message
         */
        onMessage(message, sender) {
            console.log(`[Content] Filter('${this.name}').onMessage()`, message, sender);

            if (message.action !== undefined) {
                switch (message.action) {
                    case 'update-filter':
                        if (message.data.filter.id === this.id) {
                            this.updateFilter(message.data.filter);
                        }
                        break;
                }
            }

            return true;
        }

        /**
         * Run whenever the filter data is updated
         * @param {object} filter The filter that was updated
         */
        updateFilter(filter) {
            console.log(`[Content] Filter('${this.name}').updateFilter()`, filter);
        }

        /**
         * Filters and/or modifies the provided thumb DOM nodes
         * @param {Node[]} thumbs The thumbs to filter and/or modify
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
         * @param {Node[]} thumbs The thumbs to filter
         */
        filterThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').filterThumbs()`, thumbs);
        }

        /**
         * Modifies the provided thumb DOM nodes
         * @param {Node[]} thumbs The thumbs to modify
         */
        updateThumbs(thumbs) {
            console.log(`[Content] Filter('${this.name}').updateThumbs()`, thumbs);
        }
    }

    return Filter;

})();

export default Filter;
