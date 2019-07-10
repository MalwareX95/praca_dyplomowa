export class FilterRangeController {
    constructor($scope){
        Object.assign(this, {$scope})
    }

    get model() {return this.$scope.$ctrl.item}

    $onInit(){
        this.$scope.$on('updatePlaceHolders', (e, [collection]) => {
            const key = this.$scope.$ctrl.key
            collection = collection.map(x => x[key])
            this.model.min.placeholder = Math.min(...collection)
            this.model.max.placeholder = Math.max(...collection)
        })
    }
}

export const hideInfiniteFilter = function() { return value => Number.isFinite(value) ? value : ''}