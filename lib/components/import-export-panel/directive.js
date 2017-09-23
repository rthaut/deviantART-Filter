//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.ImportExportPanel', ['ui.bootstrap'])

    .controller('ImportExportPanelCtrl', ['$scope', function ($scope) {
        $scope.heading = browser.i18n.getMessage('ImportExportHeading');

        $scope.exportHeading = browser.i18n.getMessage('ExportHeading');
        $scope.exportHelpText = browser.i18n.getMessage('ExportHelpText');

        $scope.importHeading = browser.i18n.getMessage('ImportHeading');
        $scope.importHelpText = browser.i18n.getMessage('ImportHelpText');
        $scope.importResultsHeading = browser.i18n.getMessage('ImportResultsHeading');

        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.exportFilterData = function ($event) {
            browser.runtime.sendMessage({
                'action': 'export-filters'
            }).then((response) => {
                $scope.$apply(() => {
                    let dataObj = new Blob(response.data, { type: 'text/json' });
                    let dataObjURL = window.URL.createObjectURL(dataObj);
                    console.log(dataObj);
                    console.log(dataObjURL);
                });
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': 'Something went wrong while EXPORTING filter data...'
                    });
                });
            });
        };

        $scope.clearImportResults = function ($event) {
            delete $scope.file;
            delete $scope.results;
        };

        $scope.importFilterData = function (file) {

            $scope.$apply(() => {
                $scope.importing = browser.i18n.getMessage('ImportingFilters');
                delete $scope.file;
                delete $scope.results;
            });

            browser.runtime.sendMessage({
                'action': 'import-filters',
                'data': {
                    'file': file
                }
            }).then((response) => {
                console.log(response);
                $scope.$apply(() => {
                    $scope.file = file;
                    $scope.results = angular.copy(response);
                    $scope.importing = false;
                });
            }).catch((error) => {
                $scope.$apply(() => {
                    $scope.alerts.push({
                        'type': 'danger',
                        'msg': 'Something went wrong while IMPORTING filter data...'
                    });
                    $scope.importing = false;
                });
            });
        };

        let fileInput = angular.element(document.querySelector('#fileInput'));
        fileInput.bind('change', function (e) {
            let file = e.target.files[0];
            $scope.importFilterData(file);
        });

        let fileDragDrop = angular.element(document.querySelector('#fileDragDrop'));
        fileDragDrop.bind('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.effectAllowed = 'move';
        });
        fileDragDrop.bind('dragenter', function (e) {
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

            e.dataTransfer.dropEffect = 'move';
        });
        fileDragDrop.bind('dragleave', function (e) {
            $scope.$apply(() => {
                $scope.dragHover = false;
            });
        });
        fileDragDrop.bind('dragend', function (e) {
            e.dataTransfer.clearData('text/plain');
            e.dataTransfer.effectAllowed = 'none';

            $scope.$apply(() => {
                $scope.dragHover = false;
            });
        });
        fileDragDrop.bind('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();

            $scope.$apply(() => {
                $scope.dragHover = false;
            });

            let file = e.dataTransfer.files[0];
            $scope.importFilterData(file);
        });

    }])

    .directive('importExportPanel', function () {
        return {
            templateUrl: 'template.html',
            restrict: 'E',
            replace: true,
            require: ['ImportExportPanelCtrl'],
            controller: 'ImportExportPanelCtrl'
        };
    })
