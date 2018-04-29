const Options = (() => {

    const Options = {

        /**
         *
         */
        'initDefaultOptions': async function () {
            console.log('[Background] Options.initDefaultOptions()');

            //TODO: this list should probably be a constant that is somehow tied to the "options" data in getOptions()
            var defaults = {
                'metadataCacheTTL': 7,
                'managementPanelType': 'tab',
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

            //TODO: this list should probably be a constant that is somehow tied to the "defaults"
            const data = await browser.storage.sync.get(['managementPanelType', 'metadataCacheTTL', 'placeholders']);

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
                    case 'managementPanelType':
                        opt.type = 'radio';
                        opt.values = [
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

                    case 'metadataCacheTTL':
                        opt.type = 'number';
                        opt.minimum = 0;
                        opt.maximum = 365;
                        break;

                    case 'placeholders':
                        opt.type = 'checkbox';
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
