export default function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/ogloszenia/:woj/:pow/:gmin?/:miejsc?', {
            template: '<browse-page></browse-page>',
            reloadOnUrl: false,
        }).
        when('/konto/activate/token=:token*&user=:user', {
            template:'<confirm></confirm>',
            reloadOnUrl: false,
        }).
        when('/konto/ogloszenia/:new?', {
            template: '<manage-advertisments></manage-advertisments>',
            reloadOnSearch: false
        }).
        when('/konto/edytujDane', {
            template: '<manage-account/>',
        }).
        when('/', {
            template: '<home-page/>',
            reloadOnUrl: false,
        }).
        otherwise({ redirectTo: "/" });
        
    // $locationProvider.html5Mode(true)
    // $locationProvider.hashPrefix('!')
}