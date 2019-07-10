export class serverResponse {
    constructor(message, isError){
        this.message = message
        this.isError = isError
    }
}
export class SuccessReponse extends serverResponse{
    constructor(message){
        super(message, false)
    }
}
export class ErrorResponse extends serverResponse {
    constructor(message){
        super(message, true)
    }
}


export class IUserDetails {
    get id() {return this._id}
    set id(value) {this._id = value } 
    
    get name() {return this._name}
    set name(value) {this._name = value } 
    
    get surname() {return this._surname}
    set surname(value) {this._surname = value } 
    
    get token() {return this._token}
    set token(value) {this._token = value } 
}

export class User extends IUserDetails {
    constructor(obj = {}){
        super()
    }
    get isAuth() {return !!this.token}
    clear(){
        this.id = this.name = this.surname = this.token = ''
    }
}


export class authorizationServiceProvider{
    constructor(){
        this.registerUrl = ''
        this.activateAccountUrl = ''
        this.tokenUrl = ''
        this.authorizedRoutes = []
    }
    $get($http, localStorageService, userService, user, $route, $location){
        const provider = {}
        provider.saveRegistration = registerForm => {
            provider.logOut();
            return $http.post(this.registerUrl, registerForm)
        }
        provider.login = async ({ userName, password }) => {
            provider.logOut()
            const {data: access_token} = await $http.post(this.tokenUrl, `grant_type=password&username=${userName}&password=${password}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            user.token = access_token
            Object.entries(await userService.getDetails()).forEach(([key, value]) => user[key] = value)
            localStorageService.set('authorizationData', {id: user.id, name: user.name, surname: user.surname, token: user.token, profileImage: user.profileImage, phoneNumber: user.phoneNumber});
        }
        provider.hasAccess = path => !user.isAuth && this.authorizedRoutes.includes(path)
        provider.activateAccount = form => $http.post(this.activateAccountUrl, form)
        provider.logOut = () => {
            if(this.authorizedRoutes.includes($route.current.originalPath)) $location.url('/')
            localStorageService.remove('authorizationData')
            user.clear()
        }
        provider.fillAuthData = () => {
            Object.entries(localStorageService.get('authorizationData') || {}).forEach(([key,value]) => user[key] = value)
        }
        return provider
    }
}


// export const authorizationServiceProvider = function () {
//     this.registerUrl = ''
//     this.activateAccountUrl = ''
//     this.tokenUrl = ''
//     this.authorizedRoutes = []
//     this.$get = function ($http, localStorageService, userService, user) {
//         const provider = {}
//         provider.authorizedRoutes = this.authorizedRoutes
//         provider.saveRegistration = registerForm => {
//             provider.logOut();
//             return $http.post(this.registerUrl, registerForm)
//         }
//         provider.login = async ({ userName, password }) => {
//             provider.logOut()
//             const {data: access_token} = await $http.post(this.tokenUrl, `grant_type=password&username=${userName}&password=${password}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
//             user.token = access_token
//             Object.entries(await userService.getDetails()).forEach(([key, value]) => user[key] = value)
//             localStorageService.set('authorizationData', {id: user.id, name: user.name, surname: user.surname, token: user.token});
//         }
//         provider.activateAccount = form => $http.post(this.activateAccountUrl, form)
//         provider.logOut = () => {
//             // console.log($route)
//             localStorageService.remove('authorizationData')
//             user.clear()
//         }
//         provider.fillAuthData = () => {
//             Object.entries(localStorageService.get('authorizationData') || {}).forEach(([key,value]) => user[key] = value)
//         }
//         return provider
//     }
// }

