import { ErrorResponse, SuccessReponse } from "../../shared/providers/authorizationProvider.js"

export const ConfirmComponent = {
    templateUrl: 'manageAccount/confirm/confirm.html',
    controller: class {
        constructor($scope, UserService, $routeParams){
            Object.assign(this, {$scope, userService: UserService, $routeParams})
            console.log($routeParams)
        }

        async activateAccount({userName, password}) {
            this.isActivating = true
            try {
                await this.userService.activateAccount({userName: userName.$modelValue, 
                                                        password: password.$modelValue, 
                                                        token: this.$routeParams.token, 
                                                        userId: this.$routeParams.user }) 
                this.serverResponse = new SuccessReponse('Konto zostało aktywowane')
            }
            catch({statusText, data}){
                let {message = 'Nieznany błąd', modelState = {}} = data || {}
                this.serverResponse = new ErrorResponse(`${statusText}${statusText ? ': ':''} ${message}`)
                this.$scope.$broadcast('onServerErrors', new Proxy(modelState, {
                    get: function(target, name){
                        name = name[0].toUpperCase() + name.substr(1)
                        return target[`form.${name}`]
                    }
                }))
            }
            this.isActivating = false
            this.$scope.$digest()
        }
    }
}
