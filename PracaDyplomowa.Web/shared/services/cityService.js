export class CityService {
    constructor($location){
        Object.assign(this, {$location})
    }

    get current() {return this._current}

    set current(value){
        this._current = value
        if(value == null) return
        const rest = ['gmin', 'miejsc'].filter(x => x in value).map(x => value[x]).join('/')
        this.$location.url(`/ogloszenia/${value.woj}/${value.pow + (rest.length ? `/${rest}` : '')}`)
    }

    setCityPreserveHash(city){
        const hash = this.$location.hash()
        this.current = city
        this.$location.hash(hash)
    }
 }