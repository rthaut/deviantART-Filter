const Options = (() => {

    const Options = {

        /**
         *
         */
        'initDefaultOptions': async function () {
            console.log('[Background] Options.initDefaultOptions()');

            //TODO: this list should probably be a constant that is somehow tied to the "options" data in getOptions()
            var defaults = {
                'managementPanelType': 'tab',
                'metadataBatchSize': 96,
                'metadataCacheTTL': 7,
                'metadataDebug': false,
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
         * @param {string} option the key of the option
         * @param {string} value the value of the option
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

            //TODO: this list (and the properties below) should probably be a constant that is somehow tied to the "defaults"
            // NOTE: the order used below is the display order on the options tab of the management panel
            const data = await browser.storage.sync.get([
                'placeholders',
                'managementPanelType',
                'metadataBatchSize',
                'metadataCacheTTL',
                'metadataDebug',
            ]);

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

                    case 'metadataBatchSize':
                        opt.type = 'select';
                        opt.values = [
                            {
                                'value': 16,
                                'label': 16
                            },
                            {
                                'value': 32,
                                'label': 32
                            },
                            {
                                'value': 48,
                                'label': 48
                            },
                            {
                                'value': 64,
                                'label': 64
                            },
                            {
                                'value': 80,
                                'label': 80
                            },
                            {
                                'value': 96,
                                'label': 96
                            }
                        ];
                        break;

                    case 'metadataCacheTTL':
                        opt.type = 'number';
                        opt.minimum = 0;
                        opt.maximum = 365;
                        break;

                    case 'metadataDebug':
                    case 'placeholders':
                        opt.type = 'checkbox';
                        break;

                    default:
                        opt.type = 'string';
                        break;
                }
                options.push(opt);
            }

            console.log('[Background] Options.getOptions() :: Return', options);

            return { 'options': options };
        }

    };

    return Options;

})();

export default Options;
