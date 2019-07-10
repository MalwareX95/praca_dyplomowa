export class UserApiService {
    constructor(){
        this.editUrl = null
        this.detailsUrl = null
        this.activateAccountUrl = null
        this.authorizedRoutes = []
        this.tokenUrl = null
        this.registerUrl = null
        this.changeBasicInfoUrl = null
        this.passwordUrl = null
    }
    
    $get($http){
        const provider = {}
        provider.authorizedRoutes = this.authorizedRoutes
        provider.getBearerToken = async authData => {
           const {data: access_token} = await $http.post(this.tokenUrl, `grant_type=password&username=${authData.userName}&password=${authData.password}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
           return access_token
        }
        provider.getDetails = async () => {
            const {data} = await $http.get(this.detailsUrl)
            return data
        }
        provider.activateAccount = data => {
            // debugger
            return $http.post(this.activateAccountUrl, data)
        }
        provider.changePassword = ({currentPassword, newPassword, newPasswordConfirm}) => $http.patch(this.passwordUrl, {currentPassword, newPassword, newPasswordConfirm})
        provider.register = data => $http.post(this.registerUrl, data)
        provider.edit = ({name, surname, phone, profileImage}) => {
            return $http.patch(this.changeBasicInfoUrl, {name, surname, phone, profileImage})
        }
        return provider
    }
}

export class UserService {
    static get $inject() { return ['UserApiService', 'localStorageService', 'token', '$route', '$location']}
    constructor(UserApi, localStorage, token, $route, $location){
        this.userApi = UserApi
        this.$location = $location
        this.localStorage = localStorage
        this._info = localStorage.get('authorizationData') || {}
        this.token = token
        Object.assign(token, this._info.token)
        this.$route = $route
    }
    requireAuthorization(path) { return this.userApi.authorizedRoutes.includes(path) && !this.info.token}
    logOut(){
        if(this.isOnAuthorizedRoute) this.$location.url('/')
        this.info = null
    }
    async logIn({userName, password}){
        Object.assign(this.token, await this.userApi.getBearerToken({userName, password}))
        this.info = {...await this.userApi.getDetails(), token: this.token }  
        console.log(this.info)
    }

    register({userName, email, password, confirmPassword}){
        return this.userApi.register({userName, email, password, confirmPassword})
    }

    activateAccount(data) { return this.userApi.activateAccount(data) }

    changePassword(data) { return this.userApi.changePassword(data) }

    async edit(data){ 
        var response = await this.userApi.edit(data)
        this.info = {...data, id: this.info.id}
        return response
     }

    get info() { return this._info }
    set info(value){
        this._info = value || {}
        Object.keys(this.token).forEach(key => this.token[key] = (this._info.token || {})[key])
        ;value ? this.localStorage.set('authorizationData', value) : this.localStorage.remove('authorizationData')
    }

    get isOnAuthorizedRoute() { return this.userApi.authorizedRoutes.includes(this.$route.current.originalPath) }
    get isAuth() { return this.info.token }
}

