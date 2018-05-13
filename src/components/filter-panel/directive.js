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

        browser.runtime.onMessage.addListener((message, sender) => {
            console.log('[Component] FilterPanelCtrl.browser.runtime.onMessage()', message, sender);
            if (message.action === undefined) {
                console.error('[Component] FilterPanelCtrl.browser.runtime.onMessage() :: Error', 'Message is missing required "action" property');
                return;
            }

            switch (message.action) {
                case 'filter-updated':
                    if ((message.data.filter !== undefined) && (message.data.filter === $scope.filter.id)) {
                        $scope.getItems();
                    }
                    break;
            }
        });

        $scope.getItems = function () {
            console.log('[Component] FilterPanelCtrl.getItems()');
            $scope.loading = browser.i18n.getMessage('GenericLoading', [browser.i18n.getMessage('LabelFilters')]);

            browser.runtime.sendMessage({
                'action': 'get-filter-items',
                'data': {
                    'filter': $scope.filter.id
                }
            }).then((response) => {
                console.log('[Component] FilterPanelCtrl.getItems() :: Response', response);
                if (response && response.data) {
                    $scope.$apply(() => {
                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                console.error('[Component] FilterPanelCtrl.getItems() :: Import Error', error);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('GenericLoadingError', [browser.i18n.getMessage('LabelFilters'), error.message])
                    });
                });
            }).then(() => {
                console.log('[Component] FilterPanelCtrl.getItems() :: Finally');
                $scope.$apply(() => {
                    $scope.loading = false;
                });
            });
        };
        $scope.getItems();

        $scope.addItemToFilter = function ($event) {
            console.log('[Component] FilterPanelCtrl.addItemToFilter()', $event);
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = $scope.creatingFilterLbl;

            browser.runtime.sendMessage({
                'action': 'add-filter-item',
                'data': {
                    'filter': $scope.filter.id,
                    'item': $scope.newFilterItem
                }
            }).then((response) => {
                // TODO: Chrome seems to branch here even if the background script throws an error...
                // (so response is an empty object, which triggers the below empty error)
                console.log('[Component] FilterPanelCtrl.addItemToFilter() :: Response', response);
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
                console.error('[Component] FilterPanelCtrl.addItemToFilter() :: Create Error', error);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('CreateFilterError', [error.message || ''])
                    });
                });
            }).then(() => {
                console.log('[Component] FilterPanelCtrl.addItemToFilter() :: Finally');
                $event.target.removeAttribute('disabled');
                $event.target.textContent = $scope.createFilterLbl;
            });
        };

        $scope.removeItemFromFilter = function ($event, item) {
            console.log('[Component] FilterPanelCtrl.removeItemFromFilter()', $event, item);
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = $scope.removingFilterLbl;

            browser.runtime.sendMessage({
                'action': 'remove-filter-item',
                'data': {
                    'filter': $scope.filter.id,
                    'item': item
                }
            }).then((response) => {
                console.log('[Component] FilterPanelCtrl.removeItemFromFilter() :: Response', response);
                if (response && response.data) {
                    $scope.$apply(() => {
                        updateFilterDataTableDataset(angular.copy(response.data));
                    });
                } else {
                    throw new Error();
                }
            }).catch((error) => {
                console.error('[Component] FilterPanelCtrl.removeItemFromFilter() :: Remove Error', error);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('RemoveFilterError', [error.message || ''])
                    });
                });
            }).then(() => {
                console.log('[Component] FilterPanelCtrl.removeItemFromFilter() :: Finally');
                $event.target.removeAttribute('disabled');
                $event.target.textContent = $scope.removeFilterLbl;
            });
        };

        const updateFilterDataTableDataset = function (dataset) {
            console.log('[Component] FilterPanelCtrl.updateFilterDataTableDataset()', dataset);
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
