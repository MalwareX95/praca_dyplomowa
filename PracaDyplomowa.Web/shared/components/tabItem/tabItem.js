export const TabItemDirective = function(){
    return {
        replace: true,
        scope: {},
        bindToController: {
            text: '@',
            default: '<'
        },
        controllerAs: '$ctrl',
        templateUrl: 'shared/components/tabItem/tabItem.html',
        controller: class {
            constructor($scope, $element){
                this.$scope = $scope
                this.$element = $element[0]
            }
            
            $onChanges(changes){
                if('default' in changes && changes.default.currentValue === true) this.$scope.$emit('tabItem:default', [this.text])
            }
        }
    }
}