import {RangeModel, ListModel, DateModel} from "./components/filtersPanel/filtersPanel.js";

const filters = {
    price: {
        type: RangeModel,
        label: 'cena'
    },
    kind: {
        type: ListModel,
        label: 'rodzaj'
    },
    media: {
        type: ListModel,
    },
    avialableSince: {
        type: DateModel,
        label: 'dostępne od'
    },
    area: {
        type: RangeModel,
        label: 'powierzchnia'
    },
    constructionYear: {
        type: RangeModel,
        label: 'rok budowy'
    },
    heating: {
        type: ListModel,
        label: 'ogrzewanie'
    },
    extraInfo: {
        type: ListModel,
        label: 'inf. dodatkowe'
    }
}

const dynamicEntry = (label, {value, breakline = null}) => `<strong>${label}:</strong> ${breakline ? '<br>' : ''} <span>{{${value}}}</span>`

function base(literals, whenMap, ...args) {
    literals = Array.from(literals)
    args = args.map(x => `$parent.$parent.$ctrl.item.${x}`)
    const when = whenMap(args)
    for (const [, index] of literals.map((value, index) => [value, index]).filter(([value,]) => !value)) {
        if(args.length == 0) break
        literals[index] = args.shift()
    }
    return {value: literals.join(''), when}
}

function lineEntry(literals, ...args){
    return base(literals, _args => _args[0], ...args)
}

function withWhenlineEntry(literals, ...args){
    return base(literals, _args => _args.shift(), ...args)
}

function breakLineEntry(literals, ...args){
    return {...lineEntry(literals, ...args), breakline: true}
}

const listEntries = {
    'Data dodania': lineEntry`${'creationTime'} | date:'EEE d.MM.y HH:mm'`,
    'Dostępne od': lineEntry`${'avialableSince'} | date:'longDate'`,
    'Dzielnica': withWhenlineEntry`${'city.rodzID == 6'}${'city.gmin'}`,
    'Część miasta': withWhenlineEntry`${'city.rm == 99'}${'city.miejsc'}`,
    'Powierzchnia': breakLineEntry`${'area'} + ' m2'`,
    'Czynsz': breakLineEntry`${'price'} + ' zł/mc'`,
    'Kaucja': breakLineEntry`${'deposit'} + ' zł'`,
    'Pokoi': breakLineEntry`${'rooms'}`,
    'Piętro': breakLineEntry`${'level'} + ' z ' + ${'levelFrom'}`,
    'Rodzaj': breakLineEntry`${'kind.name'}`,
    'Ogrzewanie': breakLineEntry`${'heating.name'}`,
    'Rok budowy': breakLineEntry`${'constructionYear'}`
}

export default {
    templateUrl: 'ogloszenia/ogloszenia.html',
    controller: class {
        constructor($scope, $location, CityService, advertismentsService, $filter, $routeParams){
            Object.assign(this, {$scope, $location, CityService, advertismentsService, $filter})
            this._advertisments = []
            this.sortBy = null
            this.$routeParams = $routeParams
            this.activeCardIndex = null
            this.filters = filters
            this.showDetail = false
            let hash = $location.hash()
            this.CityService.setCityPreserveHash({...$routeParams})
            if(hash) $scope.$evalAsync(() => $location.hash(hash))
            this.infoEntries = Object.entries(listEntries).map(([key, {when, ...rest}]) => ({when, template: dynamicEntry(key, rest)}))
            this.syncHashWithActiveCard = () => {
                if((this.activeCard || {}).id != $location.hash()){
                    const cardId = $location.hash()
                    this.activeCard = (this.advertisments || []).find(x => x.id == cardId)
                }
            }
            $scope.$watch('$ctrl.CityService.current', current => current && this.getAdvertisments())
            $scope.$on('$routeUpdate', (e, {params}) => {                
                if(['miejsc', 'gmin', 'pow', 'woj'].some(key => params[key] != this.CityService.current[key])){
                    this.CityService.current = params
                }
                else this.syncHashWithActiveCard()
            })
            $scope.$on('card:onClick', (e, [card]) => this.activeCard = card)
        }

        get advertisments() { return this._advertisments }
        set advertisments(value) {
            this._advertisments = this.filteredCollection = value
        }

        async getAdvertisments(){
            this.activeCard = null
            this.advertisments = await this.advertismentsService.get(this.CityService.current)
            console.log(this.advertisments)
            this.syncHashWithActiveCard()
            this.$scope.$digest()
        }
        
        nextCard(){
            this.activeCard = this.advertisments[(this.activeCardIndex + 1) % this.advertisments.length] 
        }

        previousCard(){
            this.activeCard = this.advertisments[(this.activeCardIndex - 1 + this.advertisments.length) % this.advertisments.length]
        }

        get activeCard() {return this._activeCard}
        set activeCard(value){
            this._activeCard = value
            this.activeCardIndex = this.advertisments.indexOf(value)
            this.showDetail = !!value
            this.$location.hash((value || {}).id)
            if(value){
                const card = this.advertismentsContainer[0].querySelector(`card[data-id="${value.id}"]`)
                card && card.scrollIntoView({behavior: 'smooth', block: 'center' })
            }
        }

        onDetailResizeHandler($event){
            this.advertismentsContainer[0].style.setProperty('--offset', $event + 'px')
        }
    }
}