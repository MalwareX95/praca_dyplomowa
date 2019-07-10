export const TabsComponent = {
    transclude: true,
    template: 
    `
        <div ng-transclude></div>
        <div></div>
    `,
    bindings: {
        change: '&?'
    },
    controller: class {
        constructor($scope, $element){
            this.$scope = $scope
            this.$element = $element[0]
        }

        // $postLink(){
        //     console.log(this.$element.getBoundingClientRect())
        // }

        $onInit(){
            this.$scope.$on('tabItem:default', (e, [value]) => {
                this.option = value
                e.stopPropagation()
            })

            this.$scope.$on('update', (e, [element]) => {
                const [{x: x1}, {x: x2}]  = [element.getBoundingClientRect(), this.$element.getBoundingClientRect()]
                this.$element.style.setProperty('--offset', `${x1 - x2}px`)
            })
        }

        get option() {return this._option}
        set option(value) {
            this._option = value
            this.change && this.change({$event: value})
        }
    }
}
