export const CitiesProvider = function(){
    // this.baseUrl = ''
    this.$get = function($http) {
        const provider = {}
        provider.get = (query, includePow = true) => !query ? Promise.resolve([]) : $http.get('http://localhost:58895/api/cities', { cache: true, params: { query, includePow } })
        return provider
    }
}
