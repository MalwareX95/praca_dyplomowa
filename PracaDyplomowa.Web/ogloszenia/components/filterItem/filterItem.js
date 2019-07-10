export const Template = Symbol('template')

export const FilterItemComponent = {
    template: '<div ng-include="$ctrl.template"></div>',
    bindings: {
        item: '<for',
        key: '<'
    },
    controller: class {
        get template() { return this.item.constructor[Template] }
    }
}

export function roundToFilter() { return (number, tresholdNumber = 99) => number > tresholdNumber ? `+${tresholdNumber}` : number }
export function hideInfinite() { return (value, replace, text) => Number.isFinite(value) ? `${text} ${value}` : replace}
