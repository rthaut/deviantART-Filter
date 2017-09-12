//var app = angular.module('deviantArtFilter', ['ui.bootstrap', 'deviantArtFilter.components']);
var app = angular.module('deviantArtFilter', ['ui.bootstrap', 'deviantArtFilter.components.FilterPanel', 'deviantArtFilter.components.OptionsPanel']);

app.controller('ManageCtrl', ['$scope', function ($scope) {

    $scope.title = browser.i18n.getMessage('ExtensionName');

    $scope.alerts = [];

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.getFilters = function () {
        $scope.loading = browser.i18n.getMessage('GenericLoading', browser.i18n.getMessage('LabelFilters'));

        browser.runtime.sendMessage({
            'action': 'get-filters',
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

}]);
