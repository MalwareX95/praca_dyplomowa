export const overflow = function(){
    return {
        template: '<div class="overflow-wrapper"><p ng-transclude></p></div>',
        replace: true,
        transclude: true,
        link:($scope, $element, $attrs) => {
            const action = () => {
                const $paragraf = $element.find('p[ng-transclude]')
                if($paragraf.width() > $element.width()) $paragraf.addClass('overflow')
            }
            $scope.$on('ng-overflow:refresh', action)
            angular.element(action)
        }
    }
}