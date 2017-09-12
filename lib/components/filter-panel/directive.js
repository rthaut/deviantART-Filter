//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.FilterPanel', ['ui.bootstrap'])

    .controller('FilterPanelCtrl', ['$scope', function ($scope) {
        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        var blankFilterItem = {};
        $scope.filter.properties.forEach((prop) => {
            blankFilterItem[prop.toLowerCase()] = null;
        });

        $scope.newFilterItem = angular.copy(blankFilterItem);

        $scope.isNewFilterItemValid = function () {
            var valid = true;
            angular.forEach($scope.newFilterItem, function (value, key, obj) {
                if (value == null || value == '') {
                    valid &= false;
                }
            });
            return valid;
        };

        $scope.getFilterData = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', browser.i18n.getMessage('LabelFilters'));

            browser.runtime.sendMessage({
                'action': 'get-filter-data',
                'data': {
                    'filter': $scope.filter.id
                }
            }).then((response) => {
                $scope.$apply(() => {
                    $scope.filter.data = angular.copy(response.data);
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
        $scope.getFilterData();

        $scope.addItemToFilter = function ($event, filter) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = 'Creating Filter...';   //@TODO i18n

            browser.runtime.sendMessage({
                'action': 'add-filter-item',
                'data': {
                    'filter': filter.id,
                    'item': $scope.newFilterItem
                }
            }).then((response) => {
                if (response) {
                    $event.target.removeAttribute('disabled');
                    $event.target.textContent = 'Create Filter';   //@TODO i18n

                    $scope.$apply(() => {
                        //@TODO it might be better to have the response include the new record and updated total...
                        //      or even just a brand new array of filter.data
                        //      if pagination is ever implemented, this would need to jump to the last page
                        filter.total++;
                        filter.data.push(angular.copy($scope.newFilterItem));
                        $scope.newFilterItem = angular.copy(blankFilterItem);
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': `An error occurred while creating ${filter.name} filter` + (error.message ? `: ${error.message}` : '')   //@TODO i18n
                    });
                });
            });
        }

        $scope.removeItemFromFilter = function ($event, filter, item, $index) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = 'Removing Filter...';   //@TODO i18n

            browser.runtime.sendMessage({
                'action': 'remove-filter-item',
                'data': {
                    'filter': filter.id,
                    'item': item
                }
            }).then((response) => {
                if (response) {
                    $event.target.removeAttribute('disabled');
                    $event.target.textContent = 'Remove Filter';   //@TODO i18n

                    $scope.$apply(() => {
                        filter.total--;
                        filter.data.splice($index, 1);
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': `An error occurred while removing ${filter.name} filter` + (error.message ? `: ${error.message}` : '')   //@TODO i18n
                    });
                });
            });
        };

    }])

    .directive('filterPanel', function () {
        return {
            templateUrl: 'template.html',
            restrict: 'E',
            replace: true,
            require: ['FilterPanelCtrl'],
            scope: {
                filter: '='
            },
            controller: 'FilterPanelCtrl'
        };
    })
