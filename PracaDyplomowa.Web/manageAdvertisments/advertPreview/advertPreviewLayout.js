export class EmptyCard {
    constructor(){
        this.images = []
        this.media = []
        this.extraInfo = []
        // this.city = {}
    }
}

const path = 'manageAdvertisments/advertPreview'

export const Views = {
    edit: `${path}/advertPreviewEdit.html`,
    delete: `${path}/advertPreviewDelete.html`,
    standard: `${path}/advertPreview.html`,
    emptyCard: `${path}/advertPreviewEmpty.html`
}

export const AdvertPreviewComponent = {
    templateUrl: `${path}/advertPreviewLayout.html`,
    bindings: {
        advert: '<'
    },
    controllerAs: 'advertPreviewCtrl',
    controller($scope, $element){
        this.$onInit = () => {
            this.isEditMode = false
            this.isNewCard = $scope.advert instanceof EmptyCard
        }
        this.$onChanges = changes => {
            $scope.advert = 'advert' in changes ? changes.advert.currentValue : $scope.advert
        }
        this.onClickHandler = e => {
            $scope.$emit('advertPreview:clicked', [$scope.advert, this.isEditMode])
        }
        this.$postLink = () => {
            $element.on('click', this.onClickHandler)
        }
        this.$onDestroy = () => {
            $element.off('click', this.onClickHandler)
        }
        Object.defineProperties(this, {
            promoImage: {
                get(){
                    const x = this.advert.images
                    // return (this.advert.images.find(x => !x.isDelete) || {}).location
                    return (this.advert.images.find(x => !x.isDelete) || {}).name
                }
            },
            isNewCard: {
                get(){
                    return this._isNewCard;
                },
                set(value){
                    if(value){
                        this.view = Views.emptyCard
                        $element.addClass('new-card')
                    }
                    else{
                        this.view = Views.standard
                        $element.removeClass('new-card')
                        Object.setPrototypeOf($scope.advert, Object.prototype)
                    }
                }
            }
        })
    }
}

export const EmptyCardController = function ($scope) {
    this.apply = () => $scope.$emit('advertPreview:EmptyCard:apply', [$scope.advert])
    this.delete = () => $scope.$emit('advertPreview:EmptyCard:delete', [$scope.advert])
}
export const CardController = function ($scope) {
    this.edit = () => {
        $scope.advertPreviewCtrl.isEditMode = true
        $scope.advertPreviewCtrl.view = Views.edit
    }
    this.delete = () => $scope.advertPreviewCtrl.view = Views.delete
}
export const EditCardController = function ($scope) {
    this.copy = null
    $scope.isContentChanged = false
    $scope.$watch('advert', advert => this.copy = angular.copy(advert))
    $scope.$watch('advert', advert => {
        if(!angular.equals(this.copy, advert)) $scope.isContentChanged = true
    }, true)
    this.foo = () => {
        this.copy = angular.copy($scope.advert)
        $scope.isContentChanged = false
    }
    this.apply = () => {
        $scope.$emit('advertPreview:EditAccept', [$scope.advert])
    }
    this.restore = (isCancel = false) => {
        if (isCancel) $scope.advertPreviewCtrl.view = Views.standard; else $scope.isContentChanged = false
        Object.keys($scope.advert).forEach(key => $scope.advert[key] = angular.copy(this.copy[key]))
    }
    $scope.$on('$destroy', () => $scope.advertPreviewCtrl.isEditMode = false)
}

export const DeleteCardController = function ($scope) {
    this.apply = () => {
        $scope.advertPreviewCtrl.view = Views.standard
        $scope.$emit('advertPreview:deleteAccept', [$scope.advert])
    }
    this.cancel = () => {
        $scope.advertPreviewCtrl.view = Views.standard
    }
}


// export class AdvertPreview {
//     constructor() {
//         this.templateUrl = `${path}/advertPreviewLayout.html`
//         this.scope = {
//             advert: '<',
//             animationend: '&'
//         }
//     }
//     controller($scope, $element, $attrs, $window) {
//         $scope.copyAdvert = null
//         $scope.isNewCard = null
//         $scope.setStandardView = () => $scope.view = $scope.standardView
//         $element.on('click', e => $scope.$emit('advertPreview:clicked', [$scope.advert, $scope.view == Views.standard]))
//         $element.on('animationend', e => $scope.animationend({ $event: e }))
//         $scope.$on('advertPreview:EditAccept', () => $scope.copyAdvert = angular.copy($scope.advert))

//         // $window.addEventListener('click', e => {
//         //     if (!path.includes($element[0])) {
//         //         const callback = isContentChanged => { 
//         //             if (!isContentChanged) {
//         //                 $scope.view = Views.standard 
//         //             }
//         //         }
//         //         $scope.$broadcast('lostFocus', [callback])
//         //         $scope.$digest()
//         //     }
//         // })
//         $scope.$watch('advert', advert => {
//             $scope.isNewCard = advert instanceof EmptyCard
//             if ($scope.isNewCard) { $element.addClass('new-card') } else {
//                 $scope.copyAdvert = angular.copy(advert)
//             }
//         })
//         $scope.$watch('advert', advert => {
//             if (!$scope.isNewCard && !angular.equals(advert, $scope.copyAdvert)) {
//                 $scope.view = Views.edit
//                 $scope.$broadcast('foo')
//             }
//         }, true)
//     }
// }

