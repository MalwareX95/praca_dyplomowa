export const ErrorMessageComponent = {
    templateUrl: 'shared/components/error-message/error-message.html',
    bindings: {
        for: '<',
        _messages: '<messages'
    },
    controller: class {
        constructor($scope, errorsHandlers){
            this.errorsHandlers = errorsHandlers
            this.$scope = $scope
        }

        get messages() { return this._messages || this.errorsHandlers }
        
        $postLink(){
            this.$scope.$on('onServerErrors', (e, errors) =>  this.for && this.for.$setValidity('serverError', !(this.serverErrors = errors[this.for.$name])))
            this.$scope.$watch('$ctrl.for.$modelValue', () => this.for && this.for.$setValidity('serverError', true))
        }
    }
}