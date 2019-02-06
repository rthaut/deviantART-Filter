//angular.module('deviantArtFilter.components', [])
angular.module('deviantArtFilter.components.ImportExportPanel', ['ngSanitize'])

    .controller('ImportExportPanelCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.headingImportExport = browser.i18n.getMessage('ImportExportHeading');

        $scope.exportHeading = browser.i18n.getMessage('ExportHeading');
        $scope.exportHelpText = browser.i18n.getMessage('ExportHelpText');
        $scope.exportButtonText = browser.i18n.getMessage('ExportButtonLabel');

        $scope.importHeading = browser.i18n.getMessage('ImportHeading');
        $scope.importHelpText = browser.i18n.getMessage('ImportHelpText');
        $scope.importInstructions = browser.i18n.getMessage('ImportInstructions');
        $scope.importResultsHeading = browser.i18n.getMessage('ImportResultsHeading');

        $scope.bytesLbl = browser.i18n.getMessage('LabelBytes');
        $scope.filterTypeLbl = browser.i18n.getMessage('LabelFilterType');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.exportFilterData = function ($event) {
            $event.target.setAttribute('disabled', true);
            $event.target.textContent = browser.i18n.getMessage('ExportGeneratingFile');

            browser.runtime.sendMessage({
                'action': 'export-filters'
            }).then((response) => {
                const dataObj = new Blob([JSON.stringify(response)], { 'type': 'application/json' });
                const dataObjURL = URL.createObjectURL(dataObj);

                const date = new Date();
                const filename = browser.i18n.getMessage('ExtensionName').replace(' ', '_');

                const link = document.createElement('a');
                link.href = dataObjURL;
                link.download = `${filename}-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
                link.dispatchEvent(new MouseEvent('click'));
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('ExportFiltersError', [error.message || ''])
                    });
                });
            }).then(() => {
                $scope.$apply(() => {
                    $event.target.removeAttribute('disabled');
                    $event.target.textContent = $scope.exportButtonText;
                });
            });
        };

        $scope.clearImportResults = function ($event) {
            delete $scope.file;
            delete $scope.results;
        };

        const parseFilterFile = function (file) {
            console.log('[Component] ImportExportPanelCtrl.importFilterData()', file);

            $scope.$apply(() => {
                $scope.importing = browser.i18n.getMessage('ImportingFilters');
                $scope.file = file;
            });

            const reader = new FileReader();
            reader.onerror = (event) => {
                console.error('[Component] ImportExportPanelCtrl.importFilterData() :: File Read Error', event);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('ImportFiltersError', [''])
                    });
                    $scope.importing = false;
                });
            };
            reader.onload = (event) => {
                let data;
                try {
                    data = JSON.parse(reader.result);
                } catch (error) {
                    console.error('[Component] ImportExportPanelCtrl.importFilterData() :: JSON Parse Error', error);
                    $scope.$apply(() => {
                        $scope.alerts.push({
                            'type': 'danger',
                            'msg': browser.i18n.getMessage('ImportFiltersError', [error.message || ''])
                        });
                        $scope.importing = false;
                    });
                    return;
                }

                importFilterData(data);
            };
            reader.readAsText(file);
        };

        const importFilterData = function (data) {
            console.log('[Component] ImportExportPanelCtrl.importFilterData()', data);

            $scope.$apply(() => {
                delete $scope.results;
            });

            browser.runtime.sendMessage({
                'action': 'import-filters',
                'data': data
            }).then((response) => {
                console.log('[Component] ImportExportPanelCtrl.importFilterData() :: Import Response', response);
                $scope.$apply(() => {
                    $scope.results = {
                        'headers': angular.copy(response.metadata.headers),
                        'data': angular.copy(response.results)
                    };
                    $scope.importing = false;
                });
            }).catch((error) => {
                console.error('[Component] ImportExportPanelCtrl.importFilterData() :: Import Error', error);
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': browser.i18n.getMessage('ImportFiltersError', [error.message || ''])
                    });
                    $scope.importing = false;
                });
            });
        };

        const fileInput = angular.element(document.querySelector('#fileInput'));
        fileInput.bind('change', function (e) {
            console.log('[Component] ImportExportPanelCtrl.fileInput.change', e);
            const file = e.target.files[0];
            parseFilterFile(file);
            fileInput.val('');
        });

        const fileDragDrop = angular.element(document.querySelector('#fileDragDrop'));
        fileDragDrop.bind('dragstart', function (e) {
            e.stopPropagation();
            e.preventDefault();

            const dt = e.dataTransfer !== undefined ? e.dataTransfer : e.originalEvent.dataTransfer;
            if (dt !== undefined) {
                dt.setData('text/plain', e.target.id);
                dt.effectAllowed = 'move';
            }
        });
        fileDragDrop.bind('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = true;
            });
        });
        fileDragDrop.bind('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = true;
            });

            const dt = e.dataTransfer !== undefined ? e.dataTransfer : e.originalEvent.dataTransfer;
            if (dt !== undefined) {
                dt.dropEffect = 'move';
            }
        });
        fileDragDrop.bind('dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = false;
            });
        });
        fileDragDrop.bind('dragend', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = false;
            });

            const dt = e.dataTransfer !== undefined ? e.dataTransfer : e.originalEvent.dataTransfer;
            if (dt !== undefined) {
                dt.clearData('text/plain');
                dt.effectAllowed = 'none';
            }
        });
        fileDragDrop.bind('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = false;
            });

            const dt = e.dataTransfer !== undefined ? e.dataTransfer : e.originalEvent.dataTransfer;
            if (dt !== undefined) {
                const file = dt.files[0];
                if (file !== undefined && file !== null) {
                    parseFilterFile(file);
                }
            }
        });

    }])

    .directive('importExportPanel', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'scope': true,
            'require': ['ImportExportPanelCtrl'],
            'controller': 'ImportExportPanelCtrl'
        };
    });
