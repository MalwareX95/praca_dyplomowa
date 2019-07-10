import {ManageAdvertismentsComponent} from "./manageAdvertismentsController.js"
import { filter as toDeleteFilter } from "./toDeleteFilter.js"
import { listComponent } from "./list/list.js"
import {FileSelector} from "./components/fileSelector/fileSelector.js"
import * as advertPreviewLayout from "./advertPreview/advertPreviewLayout.js"
import { DynamicField } from "./directives/dynamicField/dynamicField.js";

angular.
    module('manageAdvertisments', []).
    filter('toDelete', toDeleteFilter).
    component('advertPreview', advertPreviewLayout.AdvertPreviewComponent).
    component('manageAdvertisments', ManageAdvertismentsComponent).
    component('list', listComponent).
    component('fileSelector', FileSelector).
    directive('ngBlob', function () {
        return {
            link($scope, $element, $attrs) {
                $scope.$watch($attrs.ngBlob, value => {
                    const isFile = value instanceof File
                    $element.attr('src', isFile ? value = URL.createObjectURL(value) : value)
                    if(isFile) {
                        $element.on('load', e => URL.revokeObjectURL(value))
                        $scope.$on('$destroy', () => $element.off())
                    } 
                })
            }
        }
    }).
    directive('ngAutoResize', function() {
        return {
            link($scope, [element]) {
                const resize = e => setTimeout(() => element.style.height = `${element.scrollHeight}px`, 0)
                element.addEventListener('keydown', resize)
                $scope.$on('$destroy', () => element.removeEventListener('keydown', resize))
            }
        }
    }).
    controller('Card', advertPreviewLayout.CardController).
    controller('DeleteCard', advertPreviewLayout.DeleteCardController).
    controller('EditCard', advertPreviewLayout.EditCardController).
    controller('EmptyCard', advertPreviewLayout.EmptyCardController).
    directive('dynamicField', DynamicField).
    directive('dynamicForm', function($compile){
        return {
            replace: true,
            template: '<form></form>',
            compile(){
                let template = ''
                return {
                    pre($scope, $element, $attrs) {
                        const fields = $scope.$eval($attrs.for)
                        Object.entries(fields).forEach(([name, attributes]) => {
                            const model = attributes[Model]
                            const labelText = attributes[LabelText]
                            attributes = Object.entries(attributes).map(([name, value]) => `${name}="${value}"`).join(' ')
                            template+=
                            `
                                <label for="${name}">
                                    ${labelText}
                                    <input name="${name}" ng-model="${model}" ${attributes}>
                                </label>
                            `
                        })
                    },
                    post($scope, $element){
                        const element = angular.element(template)
                        $element.append($compile(element)($scope))
                        $compile(element, null, 100)($scope)
                    }
                }
            }
        }
    })
    .directive('customRequired', function(){
        return {
            require: '?ngModel',
            link(scope, elm, attrs, ctrl){
                if(ctrl && ctrl.$validators.required) {
                    ctrl.$validators.required = value => {
                        return value && value.length
                    }
                }
            }
        }
    })

   