// export default {
//     transclude: true,
//     ,
//     controller($scope, $element, $attrs) {
//         // this.$onInit = () => {
//         //     $scope.$watch('$parent.$index', $index => $element[0].setAttribute('data-index', $index.toString()))
//         // }
//         this.$onChanges = changes => {

//         }
//         this.ondragstart = e => {
//             // $element.removeClass('dragend')
//             // $element.addClass('dragstart')
//
//         }
//         this.ondragend = e => {
//             // $element.removeClass('dragstart dragover')
//             // $element.addClass('dragend')
//         }
//         this.ondragenter = e => {
//             // $element.removeClass('dragover dragleave')
//             // $element.addClass('dragenter')
//         }
//         this.ondragover = e => {
//             e.preventDefault()
//             // $element.addClass('dragover')
//         }
//         this.ondragleave = e => {
//             // $element.addClass('dragleave')
//             // $element.removeClass('dragover dragenter')
//         }
//         this.$postLink = () => {
//             // $scope.$watch(scope => scope.$index, $index => element.setAttribute('data-index', $index.toString()))
//             const htmlElement = $element[0]
//             $attrs.$set('draggable', 'true')
//             $attrs.$addClass('draggable')
//             let swapElements = () => {}
//             // htmlElement.addEventListener('transitionend', e => swapElements())
//             // htmlElement.addEventListener('dragstart', this.ondragstart)
//             // htmlElement.addEventListener('dragend', this.ondragend)
//             // htmlElement.addEventListener('dragover', this.ondragover)
//             // htmlElement.addEventListener('dragleave', this.ondragleave)
//             // htmlElement.addEventListener('drop', e => {
//             //     const srcDraggableIndex =  e.dataTransfer.getData('index')
//             //     const srcDraggableElement = htmlElement.parentElement.querySelector(`draggable[data-index="${srcDraggableIndex}"]`)
//             //     htmlElement.style.transform = `translate(${srcDraggableElement.offsetLeft - htmlElement.offsetLeft}px, ${srcDraggableElement.offsetTop - htmlElement.offsetTop}px)`
//             //     srcDraggableElement.style.transform = `translate(${htmlElement.offsetLeft - srcDraggableElement.offsetLeft}px, ${htmlElement.offsetTop - srcDraggableElement.offsetTop}px)`
//             //     swapElements = () => $scope.$emit('draggableElement:drop', [Number.parseInt(srcDraggableIndex), $scope.$parent.$index])
//             // })
//         }
//     },
// }


export const DraggableComponent = function () {
    return {
        transclude: true,
        restrict: 'E',
        template: '<div ng-transclude></div>',
        link($scope, [element], $attrs) {
            element.classList.add('draggable')
            element.setAttribute('draggable', 'true')
            $scope.$watch('$index', $index => element.setAttribute('data-index', $index.toString()))
            let swapElements = () => {}
            // element.addEventListener('transitionend', e => swapElements())
            // element.addEventListener('dragstart', e => {
            //     swapElements = () => {}
            //     element.classList.add('dragstart')
            //     e.dataTransfer.setData('index', $scope.$index)
            //     e.dataTransfer.effectAllowed = 'move'
            // })
            // element.addEventListener('dragend', e => element.classList.remove('dragstart'))
            // element.addEventListener('dragover', e => {
            //     e.preventDefault()
            //     element.classList.add('dragover')
            // })
            // element.addEventListener('dragleave', e => element.classList.remove('dragover')
            // )
            // element.addEventListener('drop', e => {
            //     element.classList.remove('dragover')
            //     const indexes = [e.dataTransfer.getData('index'), $scope.$eval($attrs.identifier)].map(x => Number.parseInt(x))
            //     const elements = indexes.map(index => element.parentElement.querySelector(`ng-draggable[identifier="${index}"]`))
            //     elements.forEach(element => { element.style.transition = '' })
            //     elements[1].style.transform = `translate(${elements[0].offsetLeft - elements[1].offsetLeft}px, ${elements[0].offsetTop - elements[1].offsetTop}px)`
            //     elements[0].style.transform = `translate(${elements[1].offsetLeft - elements[0].offsetLeft}px, ${elements[1].offsetTop - elements[0].offsetTop}px)`
            //     swapElements = () => {
            //         elements.forEach(x => {
            //             x.style.transition = 'unset'
            //             x.style.transform = ''
            //         })
            //         $scope.$emit('draggableElement:drop', indexes)
            //     }
            // })
        }
    }
}