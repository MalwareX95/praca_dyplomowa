

export const GalleryComponent = {
    templateUrl: 'ogloszenia/components/gallery/gallery.html',
    bindings:{
        items: '<'
    },
    controller: class {
        constructor($element, $scope){
            Object.assign(this, {$element, $scope})
        }

        $onChanges(){
            this.currentIndex = 0
        }

        $postLink(){
            this.$scope.$on('gallery-fullsize', e => this.fullscreen = true)
        }

        get currentImage(){
            return this.items && this.items[this.currentIndex]
        }

        set currentImage(value){
            this.currentIndex = this.items.indexOf(value)
            this.scrollImageIntoView()
        }
        
        scrollImageIntoView(){
            this.$element[0].querySelector(`img[key="${this.currentIndex}"]`).scrollIntoView({behavior: 'smooth', block: 'nearest' })
        }

        next(){
           this.currentIndex = (this.currentIndex + 1) % this.items.length   
           this.scrollImageIntoView()
        }

        previous(){
            this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length
            this.scrollImageIntoView()
        }

        get fullscreen(){
            return this._fullscreen
        }
        set fullscreen(value){
            ((this._fullscreen = value) ? jQuery.prototype.addClass : jQuery.prototype.removeClass).call(this.$element, 'fullscreen')
        }
    }
}