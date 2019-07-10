import { ErrorResponse, SuccessReponse } from "../../../providers/authorizationProvider.js"

export const LoginForm = {
    templateUrl: 'shared/components/forms/login/login.html',
    controller: class {
        constructor($rootScope, UserService) {
            this.$rootScope = $rootScope
            this.user = UserService
        }
        $onInit() {
            this.isLoggin = false
            this.serverResponse = null
        }
        async logIn({ $invalid, userName, password }) {
            if ($invalid) return
            this.isLoggin = true
            try {
                await this.user.logIn({
                    userName: userName.$modelValue,
                    password: password.$modelValue
                })
                this.serverResponse = new SuccessReponse('Zalogowano')
            }
            catch ({ data: { error_description = '' }, statusText = '' }) {
                this.serverResponse = new ErrorResponse(`${statusText}: ${error_description}`)
            }
            this.isLoggin = false
            this.$rootScope.$apply(this.$rootScope.modal.onSuccess)
        }
    }
}