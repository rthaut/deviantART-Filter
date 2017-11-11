//angular.module('deviantArtFilter.components', ['ngMessages', 'ngTable', 'deviantArtFilter.components.CategoryHierarchySelect'])
angular.module('deviantArtFilter.components.FilterPanel', ['ngMessages', 'ngTable', 'deviantArtFilter.components.CategoryHierarchySelect'])

    .controller('FilterPanelCtrl', ['$scope', 'NgTableParams', function ($scope, NgTableParams) {

        $scope.createHeading = browser.i18n.getMessage('LabelCreateFilterPlaceholder', [$scope.filter.name.singular]);
        $scope.filteredLbl = browser.i18n.getMessage('LabelFilteredPlaceholder', [$scope.filter.name.plural]);
        $scope.createFilterLbl = browser.i18n.getMessage('LabelCreateFilter');
        $scope.removeFilterLbl = browser.i18n.getMessage('LabelRemoveFilter');
        $scope.creatingFilterLbl = browser.i18n.getMessage('LabelCreatingFilter');
        $scope.removingFilterLbl = browser.i18n.getMessage('LabelRemovingFilter');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        const blankFilterItem = {};
        angular.forEach($scope.filter.properties.filter(prop => prop.editable), (value, key, obj) => {
            blankFilterItem[value.field] = (value.default !== undefined) ? value.default : null;
        });

        $scope.newFilterItem = angular.copy(blankFilterItem);

        $scope.showingFilterCount = function () {
            const total = $scope.filterTableData.total();
            const lower = $scope.filterTableData.count() * ($scope.filterTableData.page() - 1) + 1;
            let upper = lower + $scope.filterTableData.count() - 1;
            if (total < upper) {
                upper = total;
            }

            return browser.i18n.getMessage('ShowingFilterCount', [lower, upper, total, $scope.filteredLbl]);
        };

        const sorting = {};
        sorting[$scope.filter.properties.find(prop => prop.visible).field] = 'asc';
        $scope.filterTableData = new NgTableParams({
            'sorting': sorting
        });

        const filterTableColumns = [];
        angular.forEach($scope.filter.properties.filter(prop => prop.visible), (property) => {
            filterTableColumns.push({
                'field': property.field,
                'title': property.title,
                'type': property.type,
                'sortable': property.field,
                'show': true
            });
        });
        filterTableColumns.push({
            'field': 'action',
            'title': browser.i18n.getMessage('LabelAction'),
            'type': 'command'
        });
        $scope.filterTableColumns = filterTableColumns;

        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('[Component] FilterPanelCtrl.browser.runtime.onMessage()', message, sender, sendResponse);
            if (message.action === undefined) {
                return;
            }

            switch (message.action) {
                case 'filter-updated':
                    if ((message.data.filter !== undefined) && (message.data.filter === $scope.filter.id)) {
                        $scope.getFilterData();
                    }
                    break;
            }

            return true;
        });

        $scope.getFilterData = function () {
            $scope.loading = browser.i18n.getMessage('GenericLoading', [browser.i18n.getMessage('LabelFilters')]);

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
            $event.target.textContent = $scope.creatingFilterLbl;

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
                        $scope.form.$setPristine();

                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('CreateFilterError', [error.message || ''])
                    });
                });
            }).then(() => {
                $event.target.removeAttribute('disabled');
                $event.target.textContent = $scope.createFilterLbl;
            });
        };

        $scope.removeItemFromFilter = function ($event, item) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = $scope.removingFilterLbl;

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
                        'msg': browser.i18n.getMessage('RemoveFilterError', [error.message || ''])
                    });
                });
            }).then(() => {
                $event.target.removeAttribute('disabled');
                $event.target.textContent = $scope.removeFilterLbl;
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
        };

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
