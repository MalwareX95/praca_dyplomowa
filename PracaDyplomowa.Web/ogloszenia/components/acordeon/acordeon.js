export const Acordeon = {
    templateUrl: 'ogloszenia/components/acordeon/acordeon.html',
    transclude: true,
    bindings: {
        header: '<'
    },
    controller: class {
        constructor($element, $scope, $timeout){
            this.$element = $element
            this.$scope = $scope
            this.$timeout = $timeout
            this.isListVisible = true
        }

        $postLink(){
            this.$scope.$on('filterPanel:collapse', (e, [isCollapse]) => {this.isListVisible = isCollapse})
            this.$scope.$on('$includeContentLoaded', e => this.$timeout(() => {
                this.$element[0].style.setProperty('--height', this.$element[0].children[1].clientHeight + 'px')
                this.isListVisible = false
            }), 0)
        }
    }
}