import Filter from './Filter.class.js';
import StyleSheet from '../../../helpers/stylesheet.js';

const TagsFilter = (() => {

    const FILTER_ID = 'tags';      // the "key" used for local storage
    const FILTER_NAME = 'Tags';    // used for retrieving localized messages

    class TagsFilter extends Filter {

        constructor(id, name) {
            super(FILTER_ID, FILTER_NAME);

            this.styleSheet = StyleSheet.Create();
        }

        resetFilter() {
            console.log('[Content] TagsFilter.resetFilter()');

            StyleSheet.Reset(this.styleSheet);
        }

        updateFilter(filter) {
            console.log('[Content] TagsFilter.updateFilter()', filter);

            this.resetFilter();

            //@TODO these constants are (currently) shared between Tags and Users filters...
            //      Maybe declare them on the base Filter class instead?
            //      Or make a new CSS Filter class for them to extend?

            const selector = '.torpedo-container .thumb';
            const invisible = 'display: none !important;';

            const placeholder = [
                'z-index: 5;',
                'position: absolute;',
                'top: 0;',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: 100%;',
                'content: "";',
                `background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`
            ].join('\n');

            const placeholder_text = [
                'z-index: 6;',
                'position: absolute;',
                'top: calc(50% + 64px);',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: calc(100% - calc(50% + 64px));',
                'text-align: center;',
                'color: #B4C0B0;',
                'font-weight: bold;',
                'line-height: 0.9em'
            ].join('\n');

            filter.data.forEach((item) => {
                const text = browser.i18n.getMessage('FilterTypeTagsPlaceholderText', item.tag);

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(`body.no-placeholders ${selector}[data-tags~="${item.tag}"] { ${invisible} }`);

                // show the placeholder image and text over the link of thumbs when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags~="${item.tag}"]::before { ${placeholder} }`);
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags~="${item.tag}"]::after { content: "${text}"; ${placeholder_text} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags~="${item.tag}"] + span.info { ${invisible} }`);

                // hide the user toggle corner icon for thumbs filtered by a tag to avoid confusion
                this.styleSheet.insertRule(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags~="${item.tag}"] span.hide-user-corner { ${invisible} }`);
            });

            console.log(this.styleSheet);
        }
    }

    return TagsFilter;

})();

export default TagsFilter;
