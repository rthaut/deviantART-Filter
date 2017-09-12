var app = angular.module('deviantArtFilter', []);

app.controller('PopupCtrl', ['$scope', function ($scope) {

    document.querySelector('.icon-section-header').style.backgroundImage = `url(${browser.extension.getURL('icons/icon.svg')}`;
    $scope.heading = browser.i18n.getMessage('ExtensionName');
    $scope.manage = browser.i18n.getMessage('PopupMenuLabelManageFilters');
    $scope.toggles = browser.i18n.getMessage('PopupMenuLabelQuickSettings');

    $scope.openManagementPanel = function ($event) {
        browser.runtime.sendMessage({ 'action': 'show-management-panel' });
    }

    $scope.getOptions = function () {
        browser.runtime.sendMessage({
            'action': 'get-options'
        }).then((response) => {
            $scope.$apply(() => {
                $scope.options = response.options;
            });
        });
    };
    $scope.getOptions();

    $scope.toggleOption = function ($event, option) {
        option.value = !option.value;
        browser.runtime.sendMessage({
            'action': 'set-option',
            'data': {
                'option': option.id,
                'value': option.value
            }
        });
    }
}]);
