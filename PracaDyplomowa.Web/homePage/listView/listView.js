export const ListView = {
    templateUrl: 'homePage/listView/listView.html',
    transclude: true,
    bindings: {
        items : '<',
        startWith: '<',
        selectedIndex: '='
    },
    controller: class {
        constructor($element, $timeout){
            const [element] = $element
            this.$timeout = $timeout
            this.element = element
            this._selectedIndex = -1
            this.observerOptions = {root: element}
        }
        
        get items() { return this._items || (this._items = [])}
        set items(value) {
            this._items = value
            this._selectedIndex = -1
            const length = value.length
            this.count = this.startWith || (length < 30 ? length : 30)
        }

        get currentListElement() {return this._currentListElement}
        set currentListElement(value) {
            this._currentListElement && this._currentListElement.classList.remove('selected')
            this._currentListElement = value
            if(value) {
                this._currentListElement.classList.add('selected')
                this._currentListElement.scrollIntoView({behavior: 'smooth', block: 'end'})
            } 
        }

        get selectedItem() { return this.items[this.selectedIndex] }
        
        get selectedIndex() { return this._selectedIndex }
        set selectedIndex(value){
            if(this.items.length == 0) return 
            // this._selectedIndex = (value + this.items.length) % this.items.length
            this._selectedIndex = (value + this.count) % this.count
            console.log(this)
            this.currentListElement = this.element.querySelector(`li:nth-child(${this._selectedIndex + 1})`)
        }

        get count(){return this._count}
        set count(value){
            this._count = (value > this.items.length) ? value - (value % this.items.length) : value
        }
    }
}