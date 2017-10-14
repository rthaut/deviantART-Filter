//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.CategoryHierarchySelect', ['ui.bootstrap'])

    .directive('categoryHierarchySelect', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['?ngModel'],
            'scope': true,
            'link': function (scope, element, attrs, ctrls) {
                const ngModel = ctrls[0];

                scope.hierarchy = {
                    '/': []
                };

                scope.categories = [{
                    'catpath': '/',
                    'has_subcategory': true
                }];

                scope.catpath = ['/'];

                const getHierarchy = function (catpath) {
                    browser.runtime.sendMessage({
                        'action': 'get-category-hierarchy',
                        'data': {
                            'catpath': catpath
                        }
                    }).then((response) => {
                        if (response && response.data) {
                            scope.$apply(() => {
                                response.data.categories.forEach((category) => {
                                    if (scope.hierarchy[category.parent_catpath] === undefined) {
                                        scope.hierarchy[category.parent_catpath] = [];
                                    }
                                    scope.hierarchy[category.parent_catpath].push(category);
                                });
                            });
                        } else {
                            throw new Error();
                        }
                    });
                };
                getHierarchy('/');

                scope.onChange = function (level) {
                    ngModel.$setViewValue(scope.categories[level].catpath);
                    scope.catpath = ['/'];
                    scope.categories.forEach((category) => {
                        if (category.has_subcategory) {
                            scope.catpath.push(category.catpath);
                        }
                    });
                    if (scope.hierarchy[scope.categories[level].catpath] === undefined) {
                        if (scope.categories[level].has_subcategory) {
                            getHierarchy(ngModel.$viewValue);
                        }
                    }
                };
            }
        };
    });
