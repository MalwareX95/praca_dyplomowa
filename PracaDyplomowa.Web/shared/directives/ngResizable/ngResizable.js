export const NgResizable = function($window){
    return {
        link($scope, $element, $attrs){
            let clientX = null
            const oryginalWidth = $element.width()
            const bar = $(
            `<div draggable class="resizable">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </div>`)                             
            const onMouseMoveHandler = e => {
                const offset = -e.clientX + clientX
                $element.width($element.width() + offset)
                $scope.$evalAsync($attrs.ngResizable, {$event: $element.width() - oryginalWidth})
                clientX = e.clientX
            }

            bar.mousedown(e => {
                clientX = e.clientX
                $window.addEventListener('mousemove', onMouseMoveHandler)
            })
            
            $window.addEventListener('resize', e => {
                if($element.width() > document.body.clientWidth){
                    $element.width(document.body.clientWidth)
                }
            })

            $window.addEventListener('mouseup', e => {
                if(clientX !== null) {
                    clientX = null
                    $window.removeEventListener('mousemove', onMouseMoveHandler)
                }
            })
            $element.append(bar)
        }
    }
}