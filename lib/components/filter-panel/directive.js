//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.FilterPanel', ['ui.bootstrap', 'ngTable'])

    .controller('FilterPanelCtrl', ['$scope', 'NgTableParams', function ($scope, NgTableParams) {
        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        const blankFilterItem = {};
        angular.forEach($scope.filter.properties.required, (value, key, obj) => {
            blankFilterItem[value.field] = null;
        });

        $scope.newFilterItem = angular.copy(blankFilterItem);

        $scope.isNewFilterItemValid = function () {
            let valid = true;
            angular.forEach($scope.newFilterItem, (value, key, obj) => {
                if (value == null || value == '') {
                    valid &= false;
                }
            });
            return valid;
        };

        $scope.showing = function () {
            const total = $scope.filterTableData.total();
            const lower = $scope.filterTableData.count() * ($scope.filterTableData.page() - 1) + 1;
            let upper = lower + $scope.filterTableData.count() - 1;
            if (total < upper) {
                upper = total;
            }

            //return `Showing ${lower}-${upper} of ${total}`;
            return 'Showing ' + lower + '-' + upper + ' of ' + total;
        };

        const sorting = {};
        sorting[$scope.filter.properties.available[0].field] = 'asc';
        $scope.filterTableData = new NgTableParams({
            'sorting': sorting
        });

        const filterTableColumns = [];
        angular.forEach($scope.filter.properties.available, (property) => {
            filterTableColumns.push({
                'field': property.field,
                'title': property.title,
                'dataType': property.type,
                'sortable': property.field,
                'show': true
            });
        });
        filterTableColumns.push({
            'field': 'action',
            'title': 'Action',  //@TODO i18n
            'dataType': 'command'
        });
        $scope.filterTableColumns = filterTableColumns;

        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === undefined) {
                return;
            }

            switch (request.action) {
                case 'filter-updated':
                    if ((request.data.filter !== undefined) && (request.data.filter === $scope.filter.id)) {
                        $scope.getFilterData();
                    }
                    break;
            }
        });

        $scope.getFilterData = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', browser.i18n.getMessage('LabelFilters'));

            browser.runtime.sendMessage({
                'action': 'get-filter-data',
                'data': {
                    'filter': $scope.filter.id
                }
            }).then((response) => {
                if (response && response.data) {
                    $scope.$apply(() => {
                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('GenericLoadingError', [browser.i18n.getMessage('LabelFilters'), error.message])
                    });
                });
            }).then((response) => {
                $scope.$apply(() => {
                    $scope.loading = false;
                });
            });
        };
        $scope.getFilterData();

        $scope.addItemToFilter = function ($event) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = 'Creating Filter...';   //@TODO i18n

            browser.runtime.sendMessage({
                'action': 'add-filter-item',
                'data': {
                    'filter': $scope.filter.id,
                    'item': $scope.newFilterItem
                }
            }).then((response) => {
                if (response && response.data) {
                    $scope.$apply(() => {
                        $scope.newFilterItem = angular.copy(blankFilterItem);

                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': 'An error occurred while creating filter' + (error.message ? `: ${error.message}` : '')   //@TODO i18n
                    });
                });
            }).then(() => {
                $event.target.removeAttribute('disabled');
                $event.target.textContent = 'Create Filter';   //@TODO i18n
            });
        };

        $scope.removeItemFromFilter = function ($event, item) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = 'Removing Filter...';   //@TODO i18n

            browser.runtime.sendMessage({
                'action': 'remove-filter-item',
                'data': {
                    'filter': $scope.filter.id,
                    'item': item
                }
            }).then((response) => {
                if (response && response.data) {
                    $scope.$apply(() => {
                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': 'An error occurred while removing filter' + (error.message ? `: ${error.message}` : '')   //@TODO i18n
                    });
                });
            }).then(() => {
                $event.target.removeAttribute('disabled');
                $event.target.textContent = 'Remove Filter';   //@TODO i18n
            });
        };

        const updateFilterDataTableDataset = function (dataset) {
            const currentPage = $scope.filterTableData.page();

            $scope.filterTableData.settings({
                'dataset': dataset
            });

            if ($scope.filterTableData.isDataReloadRequired()) {
                $scope.filterTableData.reload();
            }

            $scope.filterTableData.page(currentPage);
            if ($scope.filterTableData.isDataReloadRequired()) {
                $scope.filterTableData.reload().then((data) => {
                    if (data.length === 0 && $scope.filterTableData.total() > 0) {
                        $scope.filterTableData.page($scope.filterTableData.page() - 1);
                        $scope.filterTableData.reload();
                    }
                });
            }
        }

    }])

    .directive('filterPanel', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['FilterPanelCtrl'],
            'scope': {
                'filter': '='
            },
            'controller': 'FilterPanelCtrl'
        };
    });
