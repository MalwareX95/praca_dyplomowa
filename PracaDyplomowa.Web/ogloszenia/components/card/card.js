export const CardComponent = {
    templateUrl: 'ogloszenia/components/card/card.html',
    transclude: {
        entry0: '?entry0',
        entry1: '?entry1',
        entry2: '?entry2',
        entry3: '?entry3',
    },
    bindings: {
        item: '<',
        buttonOnClick: '&'
    },
    controller: class {
        constructor($scope, $rootScope){
            this.$scope = $scope
            this.$rootScope = $rootScope
            this.style = {
                transform: `rotate(${-10 + Math.random() * 20}deg)`
            }
        }
    }
}