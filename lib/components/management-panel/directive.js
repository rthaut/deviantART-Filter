//angular.module('deviantArtFilter.components', ['ui.bootstrap', 'deviantArtFilter.components.FilterPanel', 'deviantArtFilter.components.OptionsPanel'])
angular.module('deviantArtFilter.components.ManagementPanel', ['deviantArtFilter.components.FilterPanel', 'deviantArtFilter.components.ImportExportPanel', 'deviantArtFilter.components.OptionsPanel'])

    .controller('ManagementPanelCtrl', ['$scope', function ($scope) {
        $scope.title = browser.i18n.getMessage('ExtensionName');

        $scope.manageLbl = browser.i18n.getMessage('LabelManage');
        $scope.optionsLbl = browser.i18n.getMessage('OptionsHeading');
        $scope.importExportLbl = browser.i18n.getMessage('ImportExportHeading');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getFilters = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', [browser.i18n.getMessage('LabelFilters')]);

            browser.runtime.sendMessage({
                'action': 'get-filters-meta-data',
                'data': {
                    'pagination': {
                        'limit': 100,
                        'offset': 0
                    }
                }
            }).then((response) => {
                $scope.$apply(() => {
                    $scope.filters = response.filters;
                    $scope.loading = false;
                });
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('GenericLoadingError', [browser.i18n.getMessage('LabelFilters'), error.message])
                    });
                    $scope.loading = false;
                });
            });
        };
        $scope.getFilters();
    }])

    .directive('managementPanel', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['ManagementPanelCtrl'],
            'scope': {
                'filter': '='
            },
            'controller': 'ManagementPanelCtrl'
        };
    });
