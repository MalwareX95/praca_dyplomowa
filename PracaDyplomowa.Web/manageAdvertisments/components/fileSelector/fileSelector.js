export const FileSelector = {
    require: {
        ngModel: ''
    },
    template: `<input type="file" ng-ref="$ctrl.input" ng-click="$ctrl.ngModel.$setTouched()" ng-on-change="$ctrl.onChangeHandler($event)">`,
    controller: class {
        constructor($element, $attrs){
            this.$element = $element
            this.$attrs = $attrs
        }

        onChangeHandler({target}){
            this.ngModel.$setViewValue(target.files)
            target.value = null
        }

        $postLink(){
            if('multiple' in this.$attrs) this.input.attr('multiple', 'multiple')
            this.$element.on('click', e => this.input[0].click())
        }
    }
}