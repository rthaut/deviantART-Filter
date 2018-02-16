const Options = (() => {

    const Options = {

        /**
         *
         */
        'initDefaultOptions': async function () {
            console.log('[Background] Options.initDefaultOptions()');

            var defaults = {
                'cacheMetadata': true,
                'managementPanelType': 'tab',
                'pageActionPopupMenu': true,
                'placeholders': true,
                'privateStorage': 'read'
            };

            const data = await browser.storage.sync.get();

            var options = {};
            for (var option in defaults) {
                if (data[option] === undefined) {
                    options[option] = defaults[option];
                }
            }

            return browser.storage.sync.set(options);
        },

        /**
         *
         * @param {string} option - the key of the option
         * @param {string} value - the value of the option
         */
        'setOption': function (option, value) {
            console.log('[Background] Options.setOption()', option, value);

            var opt = {};
            opt[option] = value;
            return browser.storage.sync.set(opt);
        },

        /**
         *
         */
        'getOptions': async function () {
            console.log('[Background] Options.getOptions()');

            const data = await browser.storage.sync.get(['cacheMetadata', 'managementPanelType', 'pageActionPopupMenu', 'placeholders']);

            var options = [];
            var opt;
            for (var option in data) {
                opt = {
                    'id': option,
                    'name': browser.i18n.getMessage(`Option${option}Name`),
                    'description': browser.i18n.getMessage(`Option${option}Description`),
                    'value': data[option]
                };
                switch (option) {
                    case 'cacheMetadata':
                    case 'placeholders':
                    case 'pageActionPopupMenu':
                        opt.type = 'checkbox';
                        break;

                    case 'managementPanelType':
                        opt.type = 'radio';
                        opt.values = [
                            {
                                'value': 'modal',
                                'label': browser.i18n.getMessage('OptionManagementPanelTypeValueModal'),
                                'disabled': true
                            },
                            {
                                'value': 'window',
                                'label': browser.i18n.getMessage('OptionManagementPanelTypeValueWindow')
                            },
                            {
                                'value': 'tab',
                                'label': browser.i18n.getMessage('OptionManagementPanelTypeValueTab')
                            }
                        ];
                        break;

                    default:
                        opt.type = 'string';
                        break;
                }
                options.push(opt);
            }

            return { 'options': options };
        }

    };

    return Options;

})();

export default Options;
