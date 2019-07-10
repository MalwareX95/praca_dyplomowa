import { mainController } from "./mainController.js"
import { searchBarComponent } from "./searchbar/searchbar.js"
import { ListView } from "./listView/listView.js";
import { HomePageComponent } from "./homepageComponent.js";

angular.
    module('homePage', []).
    controller('main', mainController).
    component('homePage', HomePageComponent).
    component('searchbar', searchBarComponent).
    component('lazyList', ListView).
    directive('ngMediaQuery', function () {
        return {
            link($scope, $element, $attrs) {
                console.log('ngMediaQuery')
                const mediaQuery = window.matchMedia($attrs.ngMediaQuery)
                $scope.$eval($attrs.ngMediaQueryAction, { $event: mediaQuery })
                const action = e => {
                    $scope.$eval($attrs.ngMediaQueryAction, { $event: e })
                    $scope.$digest()
                }
                mediaQuery.addListener(action)
                $scope.$on('$destory', () => mediaQuery.removeListener(action))
            }
        }
    }).
    directive('ngHeight', function () {
        return {
            link($scope, $element, $attrs) {
                $element.css('--min-height', $attrs.ngHeight)
                $element.css('--max-height', $element.height() + 'px')
                $element.css('--sneak-hover', $attrs.ngHeightSneakHover)
                $element.css('--sneak', $attrs.ngHeightSneak)
            }
        }
    }).
    directive('ngSelection', function($timeout){
        return {
            link($scope, [element]){
                let _startIndex = 0
                let _endIndex = 0
                $scope.$on('updateSelection', (e, [startIndex = _startIndex, endIndex = _endIndex]) => {
                    _startIndex = startIndex
                    _endIndex = endIndex
                    $timeout(() => {
                        element.setSelectionRange(startIndex, endIndex)
                    }, 0)
                })

                $scope.$on('removeSelection', e => {
                     element.value = element.value.slice(0, element.selectionStart)
                })
            }
        }
    }).
    directive('routerLinkActive', function($location){
        return {
            link($scope, $element, $attrs){
                $scope.$on('$locationChangeSuccess', e => {
                    const action = ($location.path() == $attrs.href.substr(3)) ? jQuery.prototype.addClass : jQuery.prototype.removeClass
                    action.call($element, 'active')
                })
            }
        }
    })