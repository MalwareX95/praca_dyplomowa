export class FilterListController {
    constructor($scope){
        this.$scope = $scope
    }

    get model() {return this.$scope.$ctrl.item}

    checked(boolean) {
        this.model.requiredCount += boolean ? 1 : -1
    }

    $onInit(){
        this.$scope.$on('updatePlaceHolders', (e, [collection]) => {       
            const key = this.$scope.$ctrl.key
            collection = collection.map(x => x[key])
            const filter = Array.isArray(collection[0]) ?  (items, name) => items.some(item => item.name == name) :
                                                           (item, name) => item.name == name      
            this.model.values.forEach(value => value.count = collection.filter(item => filter(item, value.name)).length)
        })
    }
}