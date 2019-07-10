export const CustomInputComponent = {
    templateUrl: 'shared/components/customInput/customInput.html',
    require: {
        ngModel: '',
    },
    controller: class {
        constructor($scope, $element){
            this.$scope = $scope
            this.$element = $element
        }
        $postLink(){
            const $input = this.$element.find('input')
            this.$element.on('click', () => $input[0].click())
            $input.on('change', async e => {
                this.image = window.URL.createObjectURL($input[0].files[0])
                this.ngModel.$setViewValue(await $input[0].files[0].toBase64())
                this.$scope.$digest()
            })
        }
    }
}