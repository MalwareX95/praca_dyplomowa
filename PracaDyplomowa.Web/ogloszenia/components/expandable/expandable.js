export const ExpandableComponent = {
    transclude: true,
    bindings: {
        content: '<'
    },
    template: 
    `
        <ng-transclude/>
        <div ng-if="$ctrl.hasOverflow">
            <button ng-click="$ctrl.hasOverflow = false">Pokaż więcej</button>
        </div>
    `,
    controller: class {
        constructor($element){
            this.$element = $element
            this._hasOverflow = null
        }

        get hasOverflow(){
            return this._hasOverflow
        }
        set hasOverflow(value){
            this._hasOverflow = value
            const action = value ? jQuery.prototype.removeClass : jQuery.prototype.addClass
            action.call(this.$element, 'fullsize')
        }

        $onChanges(){
            const [element] = this.$element
            this.hasOverflow = element.clientHeight > getComputedStyle(element).getPropertyValue('--visible-to').replace('px', '')
        }
    }
}
