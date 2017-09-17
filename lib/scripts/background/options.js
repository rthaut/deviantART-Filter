/**
 *
 */
/* exported initDefaultOptions */
function initDefaultOptions() {
    console.log('initDefaultOptions()');
    browser.storage.sync.get().then((data) => {
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

        browser.storage.sync.set(options);
    });
}

/**
 *
 * @param {string} option - the key of the option
 * @param {string} value - the value of the option
 */
/* exported log */
function setOption(option, value) {
    console.log(`Changing setting "${option}" to "${value}"`);
    var opt = {};
    opt[option] = value;
    return browser.storage.sync.set(opt);
}

/**
 *
 */
/* exported getOptions */
function getOptions() {
    console.log('getOptions()');
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
                            'label': 'Open as an embedded modal',
                            'disabled': true
                        },
                        {
                            'value': 'window',
                            'label': 'Open as a new window (default)'
                        },
                        {
                            'value': 'tab',
                            'label': 'Open in a new tab'
                        }
                    ]
                    break;

                default:
                    opt.type = 'string';
                    break;
            }
            options.push(opt);
        }

        return { 'options': options };
        /*return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ 'options': options });
                //reject(new Error('Failed to retrieve options from storage'));
            }, 10000);
        });*/
    });
}
