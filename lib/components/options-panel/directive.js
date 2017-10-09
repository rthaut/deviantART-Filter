//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.OptionsPanel', ['ui.bootstrap'])

    .controller('OptionsPanelCtrl', ['$scope', function ($scope) {
        $scope.headingOptions = browser.i18n.getMessage('OptionsHeading');

        $scope.enabledLbl = browser.i18n.getMessage('LabelEnabled');
        $scope.optionsLbl = browser.i18n.getMessage('LabelOptions');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getOptions = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', [$scope.optionsLbl]);

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
                        'msg': browser.i18n.getMessage('GenericLoadingError', [$scope.optionsLbl, error.message])
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
                        'msg': browser.i18n.getMessage('OptionUpdateError', option.name, [error.message || ''])
                    });
                });
            });
        };
    }])

    .directive('optionsPanel', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['OptionsPanelCtrl'],
            'controller': 'OptionsPanelCtrl'
        };
    });
