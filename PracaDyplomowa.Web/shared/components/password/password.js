export const PasswordComponent = {
    templateUrl: 'shared/components/password/password.html',
    bindings: {
        placeholder: '@?'
    },
    require: {
        ngModel: '?'
    },
    controller: class {
        constructor($scope, $attrs, $window){
            this.$window = $window
            this.isPasswordVisible = null
            this.input = null
            this.hidePassword = e => {
                this.isPasswordVisible = false
                $scope.$digest()
            }
        }
        
        $postLink(){
            this.$window.addEventListener('mouseup', this.hidePassword)
        }

        $onDestroy(){
            this.$window.removeEventListener('mouseup', this.hidePassword)
        }
    }
}