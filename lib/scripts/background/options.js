const Options = (() => {

    class Options {

        /**
         *
         */
        initDefaultOptions() {
            console.log('[Background] Options.initDefaultOptions()');
            return browser.storage.sync.get().then((data) => {
                var defaults = {
                    'managementPanelType': 'tab',
                    'pageActionPopupMenu': true,
                    'placeholders': true,
                    'privateStorage': 'read'
                };

                var options = {};
                for (var option in defaults) {
                    if (data[option] === undefined) {
                        options[option] = defaults[option];
                    }
                }

                return browser.storage.sync.set(options);
            });
        }

        /**
         *
         * @param {string} option - the key of the option
         * @param {string} value - the value of the option
         */
        setOption(option, value) {
            console.log('[Background] Options.setOption()', option, value);
            var opt = {};
            opt[option] = value;
            return browser.storage.sync.set(opt);
        }

        /**
         *
         */
        getOptions() {
            console.log('[Background] Options.getOptions()');
            var options = ['managementPanelType', 'pageActionPopupMenu', 'placeholders'];
            return browser.storage.sync.get(options).then((data) => {
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
            });
        }

    }

    return new Options();

})();

export default Options;
