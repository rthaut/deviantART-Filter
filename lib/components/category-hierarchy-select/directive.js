//angular.module('deviantArtFilter.components', ['ui.bootstrap'])
angular.module('deviantArtFilter.components.CategoryHierarchySelect', ['ui.bootstrap'])

    .directive('categoryHierarchySelect', function () {
        return {
            'templateUrl': 'template.html',
            'restrict': 'E',
            'replace': true,
            'require': ['ngModel'],
            'scope': {
                'ngModel': '='
            },
            'link': function (scope, element, attrs, ctrls) {
                const ngModel = ctrls[0];

                // this holds the complete hierarchy structure (dynamically populated)
                scope.hierarchy = {
                    '/': []
                };

                // this holds the selected categories from the hierarchy
                scope.categories = [];

                // this is the wildcard entry displayed at the top of all sub-categories
                scope.wildcard = {
                    'catpath': '',
                    'title': '*',
                    'has_subcategory': false
                };

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
                    // truncate the categories to the selected level
                    scope.categories.length = level + 1;

                    let title = '';
                    let path = scope.categories[level].catpath;

                    // if the selected category has no path and we are past the first level,
                    // then it is the wildcard, so we need the previous category's path
                    if ((path === null || path === '') && level > 0) {
                        path = scope.categories[level - 1].catpath;
                    }

                    // build a full title for the selected hierarchy
                    scope.categories.forEach((category) => {
                        if (category.title !== undefined) {
                            if (title.length) {
                                title += ' > ';
                            }
                            title += category.title;
                        }
                    });

                    // remove the leading slash in the path for the actual filter
                    ngModel.$setViewValue(path.replace(/^\//, ''));

                    //@TODO this should let us pass the entire newFilterItem object to the directive
                    //      and set both properties on it, but it doesn't work for some reason...
                    /*ngModel.$setViewValue({
                        'path': path,
                        'title': title
                    });*/

                    if (scope.hierarchy[path] === undefined) {
                        if (scope.categories[level].has_subcategory) {
                            getHierarchy(path);
                        }
                    }
                };
            }
        };
    });
