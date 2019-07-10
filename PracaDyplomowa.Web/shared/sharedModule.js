import { LoginController } from "./login/loginController.js"
import { UserApiService, UserService, CitiesProvider, advertismentsServiceProvider} from "./providers/index.js"
import { LoginForm, RegisterForm, ServerReponseComponent, ErrorMessageComponent, UserProfileComponent, CustomInputComponent, SearchboxComponent, DraggableComponent, TabsComponent, TabItemDirective, PasswordComponent} from "./components/index.js"
import { authInterceptorService, CityService} from "./services/index.js"
import { PhoneFormaterFilter } from "./filters/index.js"
import { overflow } from "./directives/index.js"

// import { SuccessReponse, ErrorResponse } from "./providers/authorizationProvider.js"
// import advertismentsServiceProvider from "./providers/advertismentsProvider.js"
// import { advertismentsFilter } from "./filters/advertismentsFilter.js"
// import { overflow } from "./directives/overflow/overflow.js"
// import { passwordComponent} from "./components/password/password.js"
// import draggable from "./components/draggable/draggable.js"
// import citiesProvider from "./providers/citiesProvider.js"
// import {advertismentsServiceProvider, authorizationServiceProvider} from "./providers/index.js"

angular.
    module('shared', []).
    provider('UserApiService', UserApiService).
    provider('CitiesService', CitiesProvider).
    value('errorsHandlers', {
        required: (field, value = null) => `Pole wymagane`,
        email: (field, value = null) => 'Niepoprawny format email',
        min: (field, value) => `Minimalna wartość to ${value}`,
        max: (field, value) => `Maksymalna wartość to ${value}`
    }).
    constant('template', function(item, joinFunc){
        const mapProps = new Map
        ([
            ['gmin', ({rodzID, gmin}) => {
                switch(rodzID){
                    case 6: return `dzielnica: ${gmin}`; 
                    case 1: return `miasto: ${gmin}`;
                    case 5: return `obszar wiejski: ${gmin}`
                    case 8: return `gmina wiejska: ${gmin}`
                    case 2: return `gmina miejska: ${gmin}`
                    case 3: return `gmina miejsko-wiejska: ${gmin}`
                }   
                return gmin
            }],
            ['miejsc', ({rm, miejsc}) => {
                switch(rm){
                    case 99: return `część miasta: ${miejsc}`
                }
                return miejsc
            }]
        ])
        

        const result = Object.
                            entries(item).
                            filter(([key, value]) => key.search(/^(\$+.*|SYM|RM|.+Id)$/i) && value).
                            map(([key, value]) => !mapProps.has(key) ? value : mapProps.get(key)(item))

        return joinFunc ? joinFunc(result) : result.join(', ')
    }).
    service('CityService', CityService).
    controller('login', LoginController).
    service('UserService', UserService).
    filter('phone', PhoneFormaterFilter).
    factory('authInterceptorService', authInterceptorService).
    component('password', PasswordComponent).
    component('loginForm', LoginForm).
    component('registerForm', RegisterForm).
    component('serverResponse', ServerReponseComponent).
    component('errorMessages', ErrorMessageComponent).
    component('userProfile', UserProfileComponent).
    component('searchbox', SearchboxComponent).
    component('customInput', CustomInputComponent).
    component('tabs', TabsComponent).
    directive('tabItem', TabItemDirective).
    directive('ngOverflow', overflow).
    directive('ngDraggable', DraggableComponent).
    directive('ngIntersectionObserver', function(){
        return {
            restrict: 'A',
            link($scope, [element], $attrs){
                const name = 'ngIntersectionObserver'
                let options = $scope.$eval($attrs[name + 'Options']) || {}
                const callback = ([entry], observer) => {
                    $scope.$evalAsync($attrs[name], {$event: {entry, observer}})
                }
                const observer = new IntersectionObserver(callback, options) 
                observer.observe(element)  
            }
        }
    }).
    provider('advertismentsService', advertismentsServiceProvider).
    constant('onBlurService', class {
        constructor($window){
            this.$window = $window
        }
        // subscripe($element, $scope){
        //     $scope.$on('$destroy',)
        // }
    })



    // provider('citiesResourceService', citiesProvider).
    // provider('authorizationService', authorizationServiceProvider).
    // filter('advertisments', advertismentsFilter).
    // component('customInput', CustomInputComponent).
    

    // directive('ngFadeChange', function() {
    //     return {
    //         link($scope, [element], $attrs){
    //             $scope.$watch($attrs.ngFadeChange, (current, previous) => {
    //                 if(current != previous) element.classList.add('ng-fade')
    //             })
    //             element.addEventListener('animationend',  ({animationName}) =>{
    //                 if(animationName == 'fadeAnimation') element.classList.remove('ng-fade')
    //             })
    //         }
    //     }
    // }).
    // service('cityService', cityService).
    
    // component('password', passwordComponent).
    
    
    