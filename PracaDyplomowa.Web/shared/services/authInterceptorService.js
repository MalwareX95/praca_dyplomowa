export const authInterceptorService = function($q, token){
    const authInterceptorServiceFactory = {};
    authInterceptorServiceFactory.request = function (config) {
        config.headers = config.headers || {};       
        if(token.access_token) config.headers.Authorization = 'Bearer ' + token.access_token
        return config
    }
    authInterceptorServiceFactory.responseError = function (rejection) {
        if (rejection.status === 401) {
            // $location.path('/login');
        }
        return $q.reject(rejection);
    }
    return authInterceptorServiceFactory;
}