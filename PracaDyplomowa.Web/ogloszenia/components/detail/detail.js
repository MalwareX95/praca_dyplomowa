export const DetailComponent = {
    templateUrl: 'ogloszenia/components/detail/detail.html',
    bindings: {
        item: '<',
        onClose: '&?'
    },
    transclude: {
        media: 'mediaTemplate',
        extraInfo: '?extraInfoTemplate',
        topBar: 'topBarTemplate',
        basicInfo: 'basicInfoTemplate',
    },
    controller: class {
        constructor($scope, $element, $rootScope, $http) {
            Object.assign(this, { $scope, $element, $rootScope, $http})
            this.isCompact = false
            this.isFullsize = false
        }

        get galleryElement() {return this._galleryElement[0]}

        async $onChanges({ item: { currentValue: item } }) {
            if(!item) return 
            this.userInfo = {
                name: (item.user || {}).name,
                surname: (item.user || {}).surname,
                phone: (item.user || {}).phoneNumber,
                userInfo: null
            } 
            this.userInfo.image = await this.$http.get(`http://localhost:58895/api/cards/${item.id}/user/picture`, {cache: true})
            this.$scope.$digest()
        }

        getColumnsClass(length) {
            return length && length < 3 ? `col${length}` : ''
        }

        onScrollHandler(sender){
            const ratio = sender.scrollTop() / this.galleryElement.offsetHeight
            this.isFullsize = false
            this.isCompact = ratio > .5
        }
    }
}


