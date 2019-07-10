import "./node_modules/angular/angular.min.js"
import "./angular-locale_pl-pl.js"
import "./node_modules/angular-route/angular-route.min.js"
import "./node_modules/angular-animate/angular-animate.min.js"
import "./node_modules/angular-sanitize/angular-sanitize.js"
import "./node_modules/angular-messages/angular-messages.js"
import "./node_modules/angular-local-storage/src/angular-local-storage.js"
import "./node_modules/angular-md5/angular-md5.js"
import "./node_modules/angular-touch/angular-touch.js"
import "./shared/sharedModule.js"
import "./ogloszenia/ogloszeniaModule.js"
import "./homePage/homePageModule.js"
import "./manageAccount/manageAccountModule.js"
import "./manageAdvertisments/manageAdvertismentsModule.js"
import routing from "./routing.js"
// import {User} from "./shared/providers/authorizationProvider.js"

Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1)
}

File.prototype.toBase64 = function(){
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(this)
    })
}


angular.
    module('app', ['ngAnimate',
                    'ngSanitize',
                    'ngRoute',
                    'LocalStorageModule',
                    'ngMessages',
                    'angular-md5',
                    'shared',
                    'ngTouch',
                    'homePage',
                    'manageAccount',
                    'ogloszenia',
                    'manageAdvertisments'
    ]).
    value('token', {}).
    constant('authorizedRoutes', ['/konto/ogloszenia/:new?', '/konto/edytujDane']).
    constant('modal', {isVisible: false, template: ''}).
    config(function(UserApiServiceProvider, authorizedRoutes){
        const apiController = 'http://localhost:58895/api/account'
        UserApiServiceProvider.detailsUrl = `${apiController}`
        UserApiServiceProvider.activateAccountUrl = `${apiController}/activate`
        UserApiServiceProvider.authorizedRoutes = authorizedRoutes
        UserApiServiceProvider.tokenUrl = 'http://localhost:58895/token'
        UserApiServiceProvider.registerUrl = 'http://localhost:58895/api/account'
        UserApiServiceProvider.changeBasicInfoUrl = 'http://localhost:58895/api/account'
        UserApiServiceProvider.passwordUrl = `${apiController}/password`
    }).
    config(routing).
    run(function ($rootScope, $location, $timeout, UserService) {
        $rootScope.modal = {}
        $rootScope.$on('$routeChangeStart', (e, { originalPath: path }) => {
            $rootScope.modal.isVisible = false
            if(UserService.requireAuthorization(path)){
                e.preventDefault()
                const url = $location.path()
                $rootScope.modal = {
                    template: 'shared/login/login.html',
                    isVisible: true,
                    onSuccess: () => $timeout(() => $location.path(url), 1000)
                }
            } 
        })
    }).
    decorator('$http', function ($delegate) {
        const $http = function (...args) {
            const promise = new Promise((resolve, reject) => {
                $delegate(args).then(response => { resolve(response) }, response => { reject(response )})
            })
            return promise;
        }
        for (const key in $delegate) {
            if ($delegate.hasOwnProperty(key)) {
                $http[key] = $delegate[key]
            }
        }
        return $http
    }).
    config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptorService');
    })

    // run(function (authorizationService) {
    //     // authorizationService.logOut()
    // }).
    // run(function ($rootScope, authorizationService, $location, $timeout) {
    //     $rootScope.redirectPath = ''
    //     $rootScope.$watch('modal.isVisible', value => {
    //         if (!value) $rootScope.$broadcast('modalHidding')
    //     })
    // }).
