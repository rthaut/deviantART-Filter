function saveOptions(e) {
    e.preventDefault();

    browser.storage.sync.set({
        privateStorage: document.querySelector('form').elements['privateStorage'].value
    });
}

function saveOption(e) {
    e.preventDefault();

    const key = e.target.name;
    if (key != null && key != '') {
        var option = {};
        option[key] = e.target.value;
        browser.storage.sync.set(option);
    }
}

function loadOptions() {
    browser.storage.sync.get().then((res) => {
        console.log(res);
        document.querySelector('form').elements['privateStorage'].value = res.privateStorage;
    }).then(() => {
        document.querySelectorAll('input').forEach((element) => {
            element.addEventListener('change', saveOption);
        });
    });
}

document.addEventListener('DOMContentLoaded', insertTranslations);
document.addEventListener('DOMContentLoaded', loadOptions);
document.querySelector('form').addEventListener('submit', saveOptions);


function insertTranslations() {
    const privateStorageFieldset = document.querySelector('form').querySelector('#privateStorageFieldset');

    privateStorageFieldset.querySelector('legend').innerText = browser.i18n.getMessage('OptionPrivateStorageName');
    privateStorageFieldset.querySelector('p.description').innerText = browser.i18n.getMessage('OptionPrivateStorageDescription');

    const values = ['Write', 'Read', 'None'];
    values.forEach((value) => {
        privateStorageFieldset.querySelector(`label[for="privateStorageValue${value}"]`).innerText = browser.i18n.getMessage(`OptionPrivateStorageValue${value}`);
    });
}
