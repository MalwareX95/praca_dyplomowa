import { SuccessReponse, ErrorResponse } from "../shared/providers/authorizationProvider.js"
export const ManageAccountComponent = {
    templateUrl: 'manageAccount/manageAccount.html',
    controller: class {
        constructor($scope, UserService, token, $timeout, errorsHandlers) {
            this.userService = UserService
            this.$scope = $scope
            this.token = token
            this.$timeout = $timeout
            this.userInfoFormMessages = {
                phone: {
                    ...errorsHandlers,
                    pattern: field => `Nr telefonu musi się składać się z 9 cyfr`,
                },
                name: {
                    ...errorsHandlers,
                    pattern: field => `Pole nie może zawierać cyfr`
                },
                surname: {
                    ...errorsHandlers,
                    pattern: field => 'Pole nie może zawierać cyfr'
                }
            }
        }
        $onInit() {
            this.$scope.user = {...this.userService.info}
            this.editResponse = null
        }

        
        async changeUserData({$invalid, name, surname, phone, profileImage = ''}) {
            if($invalid) return
            try {
                const response = await this.userService.edit({name: name.$modelValue,
                                                              surname: surname.$modelValue,
                                                              phone: phone.$modelValue,
                                                              profileImage: profileImage.$modelValue,
                                                              token: this.token})  
                                                                                                                                                                                                                                               
                this.editResponse = new SuccessReponse(response.data)
            }
            catch ({data: { message='Błąd', modelState = {}}}) {
                this.editResponse = new ErrorResponse(message)
                this.$scope.$broadcast('onServerErrors', new Proxy(modelState, {
                    get: function(target, name){
                        const property = Object.keys(target).find(key => new RegExp(`\\.${name}$`, 'i').test(key))
                        return property ? target[property] : null;
                    }
                }))
            }
            this.$timeout(() => this.editResponse = null, 2000)
            this.$scope.$digest()
        }    

        async changePassword({ currentPassword, newPassword, newPasswordConfirm }) {
            try {
                const response = await this.userService.changePassword({
                                    currentPassword: currentPassword.$modelValue,
                                    newPassword: newPassword.$modelValue,
                                    newPasswordConfirm: newPasswordConfirm.$modelValue
                                })
                
                this.passwordChangeReponse = new SuccessReponse(response.data)
            }
            catch ({data: {modelState}}) {
                this.$scope.$broadcast('onServerErrors', new Proxy(modelState, {
                    get: function(target, name){
                        const property = Object.keys(target).find(key => new RegExp(`\\.${name}$`, 'i').test(key))
                        return property ? target[property] : null;
                    }
                }))
                this.passwordChangeReponse = new ErrorResponse(modelState[""][0])
            }
            finally {
                this.$timeout(() => this.passwordChangeReponse = null, 2000)
            }
            this.$scope.$digest()   
        }
    }
}
