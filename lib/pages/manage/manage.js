//var app = angular.module('deviantArtFilter', ['deviantArtFilter.components']);
var app = angular.module('deviantArtFilter', ['deviantArtFilter.components.ManagementPanel']);

app.controller('ManagementPageCtrl', ['$scope', function ($scope) {

    $scope.title = browser.i18n.getMessage('ExtensionName');

}]);
