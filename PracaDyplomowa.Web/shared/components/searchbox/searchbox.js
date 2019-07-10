class DomEventEmitter {
    constructor($element){
        this.element = $element[0]
    }
    emitDomEvent(name){
        this.element.dispatchEvent(new Event(name))
    }
}


export const SearchboxComponent = {
    templateUrl: 'shared/components/searchbox/searchbox.html',
    transclude: true,
    bindings: { 
        debounce: '<',
        items: '<?',
        state: '<',
        onSearching: '&?'
    },
    require: {
        ngModel: '?'
    },

    controller: class extends DomEventEmitter {
        constructor($element){
            super($element)
            this.text = ''
            this.isLoading = false
        }
        

        getClass(item){
            return this.value == item ? 'active' : ''
        }

        set state(value) { this.text = '' }

        onBlurHandler(){
            this.ngModel && this.ngModel.$setTouched()
            this.emitDomEvent('blur')
        }

        onInputHandler(){
            this.value = null
            this.isLoading = true
        }

        get items() { return this._items}
        set items(value){
            this._items = value
            this.isLoading = false
        }

        get value() { return this.ngModel.$viewValue }
        set value(value) {
            (this.ngModel && this.ngModel.$setViewValue(value)) 
        }
    }
}