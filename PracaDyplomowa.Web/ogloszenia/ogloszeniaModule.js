import browsePage from "./ogloszenia.js"
import { DetailComponent, FilterListController, GalleryComponent, FilterPanelComponent, FilterItemComponent, FilterRangeController, roundToFilter, hideInfinite, ExpandableComponent, CardComponent,  } from "./components/index.js"
import { Acordeon } from "./components/acordeon/acordeon.js"
import { directive as pagesBar } from "./pagesBar/pagesBar.js"
import { NgResizable } from "../shared/directives/index.js";



angular.
    module('ogloszenia', []).
    filter('roundTo', roundToFilter).
    filter('hideInfinite', hideInfinite).
    component('browsePage', browsePage).
    component('card', CardComponent).
    component('detail', DetailComponent).
    component('gallery', GalleryComponent).
    component('filterPanel', FilterPanelComponent).
    component('filterItem', FilterItemComponent).
    component('acordeon', Acordeon).
    controller('rangeFilter', FilterRangeController).
    controller('listFilter', FilterListController).
    component('expandable', ExpandableComponent).
    directive('ngResizable', NgResizable).
    directive('dynamicTemplate', function($compile){
        return {
            priority: 100,
            terminal: true,
            link($scope, $element, $attrs){
                const {when, template} = $scope.$eval($attrs.dynamicTemplate)
                $attrs.$set('ng-show', when)
                $compile($element, null, 100)($scope)
                $element.append($compile(template)($scope))
            }
        }
    })


