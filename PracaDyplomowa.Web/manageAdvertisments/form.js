import { LabelText, Model, Template, Input, Compact} from "./directives/dynamicField/dynamicField.js"


const numericField = {type: 'number', class: 'form', min: '0'}
const numericRequiredField = {...numericField, required: ''}
export default {
    tel:{
        [LabelText]: 'Telefon',
        [Model]: '$ctrl.UserService.info.phone',
        class: 'form',
        type: 'tel',
        readonly: '',
        disabled: '',
    },
    price: {
        [LabelText]: 'Cena',
        [Model]: '$ctrl.current.price',
        ...numericRequiredField,
    },
    deposit:{
        [LabelText]: 'Kaucja',
        [Model]: '$ctrl.current.deposit',
        ...numericField,
    },
    area: {
        [LabelText]: 'Powierzchnia m<sup>2</sup>',
        [Model]: '$ctrl.current.area',
        ...numericRequiredField
    },
    level: {
        [Template]: 
        `
        <div> 
            <dynamic-field name="level" for="$ctrl.form.level.at" />
            <dynamic-field name="levelFrom" for="$ctrl.form.level.from" />   
        </div>
        `,
        at:{
            ...numericRequiredField,
            [LabelText]: 'Piętro',
            [Model]: '$ctrl.current.level'
        },
        from: {
            ...numericRequiredField,
            [LabelText]: 'z',
            min: '{{$ctrl.current.level}}',
            [Model]: '$ctrl.current.levelFrom'
        }
    },                
    rooms: {
        [LabelText]: 'Ilosc pokoi',
        [Model]: '$ctrl.current.rooms',
        ...numericRequiredField,
    },
    avialableSince:{
        [Compact]: true,
        [LabelText]: 'Dostępne od',
        [Model]: '$ctrl.current.avialableSince',
        type: 'date',
        required: '',
        class: 'form'
    },
    constructionYear:{
        [LabelText]: 'Rok budowy',
        [Model]: '$ctrl.current.constructionYear',
        max: new Date().getFullYear(),
        ...numericField
    },
    heating: {
        [LabelText]: 'ogrzewanie',
        [Model]: '$ctrl.current.heating',
        [Input]: attributes => `<select ${attributes}> </select>`,
        'ng-options': 'heating as heating.name for heating in $ctrl.hints.heating track by heating.id'
    },
    kind:{
       [LabelText]: 'Rodzaj',
       [Model]: '$ctrl.current.kind',
       [Input]: attributes => `<select ${attributes}> <option value=""></option></select>`,
       'ng-options': "kind as kind.name for kind in $ctrl.hints.kind track by kind.id",
       required: ''
    }
}