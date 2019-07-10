const Keys = {
    get ArrowUp() { return 38 },
    get ArrowDown() { return 40 },
    get Tab() { return 9 },
    get Enter() { return 13 }
}

export const searchBarComponent = {
    templateUrl: 'homePage/searchbar/searchbar.html',
    transclude: true,
    bindings: {
        compactMode: '<',
        items: '<results',
        onSearch: '&'
    },
    require:{
        ngModel: '?'
    },
    controller: class {
       constructor($scope, $element, $window, $routeParams){
           Object.assign(this, {$window, $element, $scope, $routeParams})
           this.element = $element[0] 
           this.isListVisible = false
           this.onSearchHandler = () => {}
           this.selectedIndex = 0
           this.insertHint = true
       }

       get items() { return this._items || ( this._items = [])}
       set items(value) {
           this._items = value
           console.log(value)
           this.isListVisible = true
           this.isLoading = false
       } 

       _onSearchHandler(){
            this.isListVisible = false
            this.onSearch({$event: this.lazyList.selectedItem})
            this.value = ''
       }

       onFocusHandler(){
            this.isListVisible = true
            this.element.dispatchEvent(new FocusEvent('focus'))
       }

       onBlurHandler(){
            this.element.dispatchEvent(new FocusEvent('blur'))
       }

       onKeydownHandler($event) { 
        if (Object.values(Keys).includes($event.keyCode)){
            $event.preventDefault()
            switch ($event.keyCode){
                case Keys.ArrowDown: ++this.selectedIndex; break
                case Keys.ArrowUp: --this.selectedIndex; break
                case Keys.Enter: this.onSearchHandler(); return              
            }
         }
       }

       onInputHandler(){
           this.isListVisible = true
           this.isLoading = true && this.value
       }

       $postLink(){
            this.$window.addEventListener('click', e => {
                if(!e.path.includes(this.$element[0])) {
                    this.isListVisible = false
                    if(this.compactMode) this.compactExpanded = false
                    this.$scope.$broadcast('removeSelection')
                    this.$scope.$digest()
                } 
            })
       }

       get value() { return this.ngModel.modelValue || this._value }
       set value(value){
           (this.ngModel && this.ngModel.$setViewValue(value)) || (this._value = value)
       }

       get compactMode()  { return this._compactMode }
       set compactMode(value)  {
            this._compactMode = value
            if (value) {
                this.$element.addClass('compact')
                this.compactExpanded = false
            }
            else {
                this.$element.removeClass('compact')
                this.compactExpanded = null
            }
        }

       get compactExpanded() { return this._compactExpanded  }
       set compactExpanded(value){
            switch (this._compactExpanded = value) {
                case true:
                    this.$element.addClass('expand')
                    this.onSearchHandler = this._onSearchHandler
                    break
                case null:
                    this.$element.removeClass('expand')
                    this.onSearchHandler = this._onSearchHandler
                    break;
                case false:
                    this.$element.removeClass('expand')
                    this.onSearchHandler = () => this.compactExpanded = true
                    break
            }
       }
    }
}
