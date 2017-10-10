//var app = angular.module('deviantArtFilter', ['deviantArtFilter.components']);
var app = angular.module('deviantArtFilter', ['deviantArtFilter.components.ManagementPanel']);

app.controller('ManagementPageCtrl', ['$scope', function ($scope) {

    browser.management.getSelf().then((info) => {
        $scope.$apply(() => {
            $scope.info = angular.copy(info);
        });
    });

}]);
