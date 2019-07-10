export const ServerReponseComponent = {
    bindings: {
        response: '<'
    },
    template: 
    `<span style="white-space: pre-line"
           ng-show="$ctrl.response" 
           ng-class="{success: !$ctrl.response.isError, error: $ctrl.response.isError}"> {{$ctrl.response.message}}</span>`
}