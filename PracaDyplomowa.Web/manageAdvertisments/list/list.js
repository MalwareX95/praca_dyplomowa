export const listComponent = {
    templateUrl: `manageAdvertisments/list/list.html`,
    require:{
        ngModel: ''
    },
    bindings: {
        all: '<',
        empty: '@?',
        placeholder: '@?'
    },
    transclude: true,
    controller: class {
        constructor($element, $window, $scope){
            Object.assign(this, {$element, $window, $scope})
            this.searchValue = ''
            this.isListVisible = false
            this.isValid = item => item.isSelected != null && (!this.searchValue ? true : item.value.name.toLowerCase().startsWith(this.searchValue.toLowerCase()))
        }

        get selected() {return this.ngModel.$modelValue}
        set selected(value) { this.ngModel.$setViewValue(value)}

        get isAllTaken() { return (this.all || []).every(x => x.isSelected == null) }
        get isAnySelected() {return (this.all || []).some(x => x.isSelected)}

        $onChanges({all = {}}) {
            if(all.currentValue){
                this.all = all.currentValue.map(item => ({value: item, isSelected: false}))
            }
        }

        $onInit(){
            this.$scope.$watch('$ctrl.selected', selected => {
                if(selected && this.all){
                    this.all.forEach(item => item.isSelected = selected.find(({id}) => id == item.value.id) ? null : false)
                }
            })
        }

        $postLink(){
            this.$window.addEventListener('click', e => {
                if (this.div && !e.path.includes(this.div[0])) {
                    this.isListVisible = false
                    this.$scope.$digest()
                }
            })
        }

        removeItem(item){
            item.isSelected = false
            this.selected.splice(this.selected.findIndex(x => x.id == item.value.id), 1)
            this.ngModel.$validate()
        }

        apply(){
            this.searchValue = ''
            this.all
                .filter(x => x.isSelected)
                .forEach(x => {
                    x.isSelected = null
                    this.selected.push(x.value)
                })
            this.ngModel.$validate()
        }

        clearAll() { 
            this.all.forEach(x => x.isSelected = false) 
            this.selected = []
        } 
    }
}



