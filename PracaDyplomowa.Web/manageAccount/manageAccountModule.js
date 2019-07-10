import {ManageAccountComponent} from "./manageAccountController.js"
import {ConfirmComponent} from "./confirm/confirmController.js"

angular.
    module('manageAccount', []). 
    component('manageAccount', ManageAccountComponent).
    component('confirm', ConfirmComponent).
    directive('ngInput', function($compile){
        return {
            template: '<input>',
            replace: true,
            terminal: true,
            priority: 100,
            link($scope, $element, $attrs){
                $attrs.$set('ngShow', true)
                const ngModel = $scope.$eval($attrs.ngModel)
                $compile($element, null, 100)($scope)
            }
            // compile($element, attrs){
            //     attrs.$set('ngShow', true)
            //     const compiled = $compile($element, null, 100)
            //     return ($scope, $element, $attrs, ngModel) => {
            //         // console.dir(compiled)
            //         $attrs.$set()
            //         compiled($scope)
            //     }
            // }
        }
    })