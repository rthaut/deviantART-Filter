//angular.module('deviantArtFilter.components', [])
angular.module('deviantArtFilter.components.OptionsPanel', ['ngMessages'])

    .controller('OptionsPanelCtrl', ['$scope', function ($scope) {

        $scope.labels = {
            'optionsHeading': browser.i18n.getMessage('OptionsHeading'),
            'enabled': browser.i18n.getMessage('LabelEnabled'),
            'minimum': browser.i18n.getMessage('OptionLabelMinimum'),
            'maximum': browser.i18n.getMessage('OptionLabelMaximum'),
            'required': browser.i18n.getMessage('OptionLabelRequired'),
        };
        console.log('[Component] OptionsPanelCtrl :: Labels', $scope.labels);

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getOptions = function () {
            console.log('[Component] OptionsPanelCtrl.getOptions()');
            $scope.loading = browser.i18n.getMessage('GenericLoading', [$scope.optionsLbl]);

            browser.runtime.sendMessage({
                'action': 'get-options'
            }).then((response) => {
                console.log('[Component] OptionsPanelCtrl.getOptions() :: Response', response);
                $scope.$apply(() => {
                    $scope.options = response.options;
                    $scope.loading = false;
                });
            }).catch((error) => {
                console.log('[Component] OptionsPanelCtrl.getOptions() :: Error', error);
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
            console.log('[Component] OptionsPanelCtrl.changeOption()', option);
            if ($scope.OptionsPanelCtrlForm[option.id].$valid) {
                browser.runtime.sendMessage({
                    'action': 'set-option',
                    'data': {
                        'option': option.id,
                        'value': option.value
                    }
                }).catch((error) => {
                    console.log('[Component] OptionsPanelCtrl.changeOption() :: Error', error);
                    $scope.$apply(() => {
                        option.value = !option.value;
                        $scope.alerts.push({
                            'type': 'danger',
                            'msg': browser.i18n.getMessage('OptionUpdateError', option.name, [error.message || ''])
                        });
                    });
                });
            }
        };
    }])

    .directive('optionsPanel', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'scope': true,
            'require': ['OptionsPanelCtrl'],
            'controller': 'OptionsPanelCtrl'
        };
    });
