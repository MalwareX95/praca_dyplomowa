export const Model = Symbol('model')
export const LabelText = Symbol('labelText')
export const Template = Symbol('template')
export const Input = Symbol('input')
export const Compact = Symbol('compact')

export const DynamicField = function($compile, errorsHandlers){
    return {
        priority: 100,
        terminal: true,
        link($scope, $element, $attrs){
            const field = $scope.$eval($attrs.for)
            const createTemplate = () => {
                const mapObjToString = obj => Object.entries(obj).map(([key, value]) => `${key}="${value}"`).join(' ') 
                const element = Input in field ? field[Input](mapObjToString({name:$attrs.name, 'ng-model': field[Model], ...field})) : 
                `<input name="${$attrs.name}" ng-model="${field[Model]}" ${mapObjToString(field)}>`

                return `
                <label for="${$attrs.name}">
                    ${element}
                    <div style="white-space:nowrap" ng-class="{'stay-up': ${field[Compact] ? 'true' : `${field[Model]} != null || (form.${$attrs.name}.$invalid && form.${$attrs.name}.$touched)`}}" ng-messages="form.${$attrs.name}.$error">
                        ${field[LabelText]} <span>:</span>
                        ${
                            Object.entries(errorsHandlers)
                                  .filter(([key, value]) => key in field)
                                  .map(([key, value]) => `<span ng-message="${key}" style="white-space: nowrap">*${value($attrs.name, field[key])}</span>`)
                                  .join('\n')
                        }
                    </div>
                </label>`
            }
            const element = angular.element(Template in field ? field[Template] : createTemplate())
            $element.replaceWith(element)
            $compile(element, null, 100)($scope)
        }
    }
}