
export const directive = function () {
    return {
        scope: {
            itemsCount: "<",
            elementsOnPage: "<",
            currentPage: "<?startPage"
        },
        templateUrl: 'ogloszenia/pagesBar/pagesBar.html',
        controller: ($scope, $element, $attrs, $timeout, $location) => {
            const pages = [...Array(10).keys()]
            $scope.pages = pages
            $scope.$watch('currentPage', () => $scope.$parent.$broadcast('pagesBar:pageChanged', $scope.currentPage))
            $scope.pagesCount = () => Math.ceil($scope.itemsCount / $scope.elementsOnPage)
            $scope.isDisabled = $index => ($index + $scope.section) * $scope.elementsOnPage >= $scope.itemsCount
            Object.defineProperty($scope, 'section', {
                get: function () {
                    return Math.trunc($scope.currentPage / ($scope.elementsOnPage + 1)) * 10
                },
                set: function (value) {
                    value = value - $scope.section
                    if (value) {
                        $scope.direction = value < 0
                        const pagesCount = $scope.pagesCount()
                        if ($scope.section == 0 && pagesCount <= 10) return;
                        $timeout(() => {
                            const section = $scope.section + value * 10
                            let x = Math.trunc((section % pagesCount) / 10) * 10
                            let y = Math.floor(Math.pow(1 / (9 + pagesCount), Math.sign(section || 1)))
                            let z = $scope.direction && y == 0 ? 9 : 0
                            $scope.currentPage = y + x + z
                            $scope.pages = []
                            $timeout(() => { $scope.pages = pages }, 650)
                        }, 20)
                    }
                }
            })
        }
    }
}
