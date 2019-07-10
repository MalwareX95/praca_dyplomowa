import { ErrorResponse, SuccessReponse } from "../../../providers/authorizationProvider.js"

export const RegisterForm = {
    templateUrl: 'shared/components/forms/register/register.html',
    controller: class {
        constructor($scope, UserService, errorsHandlers){
            this.user = UserService
            this.pending = false
            this.serverResponse = null
            this.$scope = $scope
            this.messages = {...errorsHandlers, pattern: field => 'Hasła są niezgodne'}
        }
        
        async register({$invalid, confirmPassword, password, email, userName}){
            if ($invalid) return
            this.serverResponse = null
            this.pending = true
            try{
                await this.user.register({
                    confirmPassword: confirmPassword.$modelValue,
                    password: password.$modelValue,
                    email: email.$modelValue,
                    userName: userName.$modelValue
                })
                this.serverResponse = new SuccessReponse('Przejdź do swojej poczty w celu aktywacji konta')
            }
            catch({statusText, data: { message, modelState }}){
                this.serverResponse = new ErrorResponse(`${statusText}: ${message}`)
                this.$scope.$broadcast('onServerErrors', new Proxy(modelState, {
                    get: function(target, name){
                        name = name[0].toUpperCase() + name.substr(1)
                        return target[`userModel.${name}`]
                    }
                }))
            }
            this.pending = false
            this.$scope.$digest()
        }
    }
}