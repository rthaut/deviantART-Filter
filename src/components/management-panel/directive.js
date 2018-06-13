//angular.module('deviantArtFilter.components', ['deviantArtFilter.components.FilterPanel', 'deviantArtFilter.components.ImportExportPanel', 'deviantArtFilter.components.OptionsPanel'])
angular.module('deviantArtFilter.components.ManagementPanel', ['deviantArtFilter.components.FilterPanel', 'deviantArtFilter.components.ImportExportPanel', 'deviantArtFilter.components.OptionsPanel'])

    .config([
        '$compileProvider',
        function ($compileProvider) {
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|moz-extension):|data:image\//);
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension|moz-extension):/);
        }
    ])

    .controller('ManagementPanelCtrl', ['$scope', function ($scope) {

        $scope.labels = {
            'manage': browser.i18n.getMessage('LabelManage'),
            'filters': browser.i18n.getMessage('LabelFilters'),
            'optionsHeading': browser.i18n.getMessage('OptionsHeading'),
            'importExport': browser.i18n.getMessage('ImportExportHeading'),
            'version': browser.i18n.getMessage('LabelVersion')
        };
        console.log('[Component] ManagementPanelCtrl :: Labels', $scope.labels);

        browser.management.getSelf().then((info) => {
            $scope.$apply(() => {
                $scope.info = angular.copy(info);
            });
        });

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getFilters = function () {
            console.log('[Component] ManagementPanelCtrl.getFilters()');
            $scope.loading = browser.i18n.getMessage('GenericLoading', [$scope.labels.filters]);

            browser.runtime.sendMessage({
                'action': 'get-filters-meta-data',
                'data': {
                    'pagination': {
                        'limit': 100,
                        'offset': 0
                    }
                }
            }).then((response) => {
                console.log('[Component] ManagementPanelCtrl.getFilters() :: Response', response);
                $scope.$apply(() => {
                    $scope.filters = response.filters;
                    $scope.loading = false;
                });
            }).catch((error) => {
                console.log('[Component] ManagementPanelCtrl.getFilters() :: Error', error);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('GenericLoadingError', [$scope.labels.filters, error.message])
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
