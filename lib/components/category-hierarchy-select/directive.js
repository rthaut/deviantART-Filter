//angular.module('deviantArtFilter.components', [])
angular.module('deviantArtFilter.components.CategoryHierarchySelect', [])

    .controller('categoryHierarchySelectCtrl', ['$scope', '$attrs', function ($scope, $attrs) {

        // this holds the complete hierarchy structure (dynamically populated)
        $scope.hierarchy = {
            '/': []
        };

        // this holds the selected categories from the hierarchy
        $scope.categories = [];

        // this is the wildcard entry displayed at the top of all sub-categories
        $scope.wildcard = {
            'catpath': '',
            'title': '*',
            'has_subcategory': false
        };

        $scope.$watch('path', function (val) {
            if (val === null || val === '') {
                $scope.categories.length = 0;
            }
        });

        const getHierarchy = function (catpath) {
            browser.runtime.sendMessage({
                'action': 'get-category-hierarchy',
                'data': {
                    'catpath': catpath
                }
            }).then((response) => {
                if (response && response.data) {
                    $scope.$apply(() => {
                        response.data.categories.forEach((category) => {
                            if ($scope.hierarchy[category.parent_catpath] === undefined) {
                                $scope.hierarchy[category.parent_catpath] = [];
                            }
                            $scope.hierarchy[category.parent_catpath].push(category);
                        });
                    });
                } else {
                    throw new Error();
                }
            });
        };
        getHierarchy('/');

        $scope.onChange = function (level) {
            // truncate the categories to the selected level
            $scope.categories.length = level + 1;

            let name = '';
            let path = $scope.categories[level].catpath;

            // if the selected category has no path and we are past the first level,
            // then it is the wildcard, so we need the previous category's path
            if ((path === null || path === '') && level > 0) {
                path = $scope.categories[level - 1].catpath;
            }

            // build the full name for the selected hierarchy
            $scope.categories.forEach((category) => {
                if (category.title !== $scope.wildcard.title) {
                    if (name.length) {
                        name += ' > ';
                    }
                    name += category.title;
                }
            });

            $scope.path = path.replace(/^\//, '');
            $scope.name = name;

            if ($scope.hierarchy[path] === undefined) {
                if ($scope.categories[level].has_subcategory) {
                    getHierarchy(path);
                }
            }
        };

    }])

    .directive('categoryHierarchySelect', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['categoryHierarchySelect'],
            'scope': {
                'path': '=filterPath',
                'name': '=filterName'
            },
            'controller': 'categoryHierarchySelectCtrl'
        };
    });
