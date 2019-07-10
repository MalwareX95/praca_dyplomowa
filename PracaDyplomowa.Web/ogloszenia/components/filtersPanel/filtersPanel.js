import {Template} from "../filterItem/filterItem.js"

export const GetAttributes = Symbol('Attributes')

export class ListModel {
    constructor(iterable){
        this.requiredCount = 0
        iterable = Array.from(iterable)
        const set = new Set(iterable.flat().map(x => x.name))

        const isArray = Array.isArray(iterable[0])
        const filter =  isArray ? (collection, name) => collection.find(item => item.name == name) : 
                                  (item, name) => item.name == name

        this._isValid = isArray ? value => this.requiredItems.every(({name}) => value.find(x => x.name == name)) : 
                                  value => this.requiredItems.some(x => x.name == value.name)

        this.values = [...set].map(name => ({name, 
                                             isChecked: false, 
                                             count: iterable.filter(x => filter(x, name)).length}))
    }

    get requiredItems() { return this.values.filter(x => x.isChecked) }
    static get [Template](){ return 'ogloszenia/components/filterItem/filterList/filterList.html' }

    isValid(value) { return this.requiredCount == 0  ? true : this._isValid(value) }
}

export class RangeModel {
    constructor(iterable){
       iterable = Array.from(iterable)
       this.min = {
           value: null,
           placeholder: Math.min(...iterable)
       }
       this.max = {
           value: null,
           placeholder: Math.max(...iterable)
       }
    }

    static get [Template](){ return 'ogloszenia/components/filterItem/filterRange/filterRange.html'}

    isValid(value) {
        if(Object.values(this).some(({value}) => value != null)){
            const _isValid = (this.min.value || 0) <= value && value <= (this.max.value || Number.POSITIVE_INFINITY)
            if(!_isValid) return false
        } 
        return true
    }
}

export class DateModel{
    constructor(iterable){
        this.date = null
    }

    static get [Template](){
        return 'ogloszenia/components/filterItem/filterDate/filterDate.html'
    }

    isValid(value){
        return this.date ? new Date(value) >= this.date : true
    }
}


export const FilterPanelComponent = {
    templateUrl: 'ogloszenia/components/filtersPanel/filtersPanel.html',
    bindings: {
        isOpen: '=',
        onReset: '&',
        collection: '<',
        collectionChange:'&',
        // sortOptions: '<',
        sortOptionChange: '&',
        filtersType: '<',
        // mapDisplay: '<'
    },
    transclude: true,
    controller: class {
        constructor($element, $scope){
            Object.assign(this, {$element, $scope})
            this.filteredCollection = []
        }

        updatePlaceholders(){
            if(this.filters == null) return
            const filters = Object.entries(this.filters)
            this.filteredCollection =  (this.collection || []).filter(item => filters.every(([name, filter]) => filter.isValid(item[name])))
            this.$scope.$broadcast('updatePlaceHolders', [this.filteredCollection])
        }

        *mapCollection(func){
            for (const item of this.collection) yield func(item)
        }

        reset(){
            this.collectionChange({$event: this.collection})
            this.filteredCollection = null
            this.filters = {} 
            if(this.collection && this.collection.length){
                Object.entries(this.filtersType).forEach(([key, {type: constructor}]) => this.filters[key] = new constructor(this.mapCollection(x => x[key])))
            }
        }

        $onInit(){
            this.$scope.$watch('$ctrl.isOpen', isOpen => {
                (isOpen ? jQuery.prototype.addClass : jQuery.prototype.removeClass).call(this.$element, 'open')
            })

            this.$scope.$watch('$ctrl.collection',  () => this.reset())
            
            this.$scope.$watch('$ctrl.filters', () => this.updatePlaceholders(), true)
        }
    }
}


