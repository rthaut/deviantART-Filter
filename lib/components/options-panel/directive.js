//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.OptionsPanel', ['ui.bootstrap'])

    .controller('OptionsPanelCtrl', ['$scope', function ($scope) {
        $scope.heading = browser.i18n.getMessage('ExtensionName') + ' ' + browser.i18n.getMessage('OptionsHeading');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getOptions = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', browser.i18n.getMessage('LabelOptions'));

            browser.runtime.sendMessage({
                'action': 'get-options'
            }).then((response) => {
                $scope.$apply(() => {
                    $scope.options = response.options;
                    $scope.loading = false;
                });
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('GenericLoadingError', [browser.i18n.getMessage('LabelOptions'), error.message])
                    });
                    $scope.loading = false;
                });
            });
        };
        $scope.getOptions();

        $scope.changeOption = function (option) {
            browser.runtime.sendMessage({
                'action': 'set-option',
                'data': {
                    'option': option.id,
                    'value': option.value
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    option.value = !option.value;
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': `An error occurred while updating the "${option.name}" option` + (error.message ? `: ${error.message}` : '')   //@TODO i18n
                    });
                });
            });
        }
    }])

    .directive('optionsPanel', function () {
        return {
            templateUrl: 'template.html',
            restrict: 'E',
            replace: true,
            require: ['OptionsPanelCtrl'],
            controller: 'OptionsPanelCtrl'
        };
    })
