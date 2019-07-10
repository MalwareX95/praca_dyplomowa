export const advertismentsServiceProvider = function () {
    let base = ''
    this.config = _url => {
        base = _url
    }
    this.$get = function ($http) {
        let provider = {}
        provider.getUserCards = async () =>  {
            const {data} = await $http.get('http://localhost:58895/api/cards/user')
            data.flatMap(({images}) => images).forEach(image => image.name = `http://localhost:58895/Images/${image.name}`)
            data.forEach(x => { if(x.avialableSince) x.avialableSince = new Date(x.avialableSince) })
            return data
        }
        provider.getHints = async () => {
            const {data} = await $http.get('http://localhost:58895/api/cards/hints')
            return data
        }

        provider.get = async params => {
            params = Object.entries(params).filter(([key,]) => !key.startsWith('$$')).map(([key, value]) => `${key}=${value}`).join('&')
            const {data} = await ($http.get(`http://localhost:58895/api/cards/gmina?${params}`))
            data.flatMap(({images}) => images).forEach(image => image.name = `http://localhost:58895/Images/${image.name}`)
            return data
        }  
        provider.put = (id, card) => $http.put(`http://localhost:58895/api/cards/${id}`, card)
        provider.delete = guid => $http.delete(`http://localhost:58895/api/cards/${guid}`)
        return provider;
    }
}
