import { EmptyCard } from "./advertPreview/advertPreviewLayout.js"
import form from "./form.js"
import { signalRClient } from "../homePage/mainController.js";

export const ManageAdvertismentsComponent = {
    templateUrl: 'manageAdvertisments/manageAdvertisments.html',
    controller: class {
        constructor($scope, advertismentsService, $location, md5, UserService, errorsHandlers, orderByFilter, template){
            Object.assign(this, {$scope, advertismentsService, $location, md5, UserService, template})
            Object.assign(this, signalRClient({hubName: 'citiesHub'}))
            this.citiesHubProxy.on('citiesResult', results => $scope.$evalAsync(() => this.searchbox.items = results ))
            this.userCards = []
            this.mediaErrorHandlers = {...errorsHandlers, required: () => 'Media są wymagane do ogłoszenia !'}
            this.searchboxErrorsHandlers = {...errorsHandlers, required: field => 'Wybierz miasto z listy !'}
            this.hints = {}
            this.cities = []
            this.orderBy = '-creationTime'
            this.editMode = null
            this.form = form
            advertismentsService.getUserCards().then(cards => {
                this.userCards = orderByFilter(cards, this.orderBy)
                if (this.isNewCardActive) this.addNewCard(); else this.current = this.userCards[0]
                $scope.$digest()
            })
            advertismentsService.getHints().then(hints => {
                this.hints = hints
                $scope.$digest()
            })        
        }

        get isNewCardActive(){ return this.$location.hash() == 'new'}
        get freeslotsCount(){ return 8 - ((this.current || {}).images || []).length }

        get isCompleteUserInfo() { 
            const {phone, surname, name} = this.UserService.info
            return phone && surname && name
        }

        get current() {return this._current}
        set current(value){
            this._current = value
            this.cities = (value || {}).city ? [value.city] : []
        }


        addNewCard(){
            if (this.current instanceof EmptyCard) this.userCards.remove(this.current)
            const newCard = new EmptyCard()
            this.userCards.push(newCard)
            this.editMode = true
            this.current = newCard
        }

        async concate(files){
            files = Array.from(files)
            const avialableSlots = this.freeslotsCount
            files.length = (files.length > avialableSlots) ? avialableSlots : files.length
            if (avialableSlots > 0) {
                for await (const file of files.map(file => file.toBase64())) {
                    this.current.images.push({ name: file })
                    this.$scope.$digest()
                }
            }
        }

        async onApplyHandler(e, [card]){
            Object.assign(card, {...(card.city || {})})
            card.images = card.images.filter(x => !x.isDelete)
            return this.advertismentsService.put(card.id, card)
        }

        onFocusHandler(){
            this.citiesHubConnection.start().done(() => {
                this.onSearchingHandler = $event => this.citiesHubProxy.invoke('cities', $event)
                // if(this.searchbox.text) this.onSearchingHandler(this.searchbox.text)
            })
        }

        $postLink(){
            this.$scope.$on('advertPreview:clicked', (e, [card, isEditMode]) => {
                this.editMode = card instanceof EmptyCard ? true : isEditMode
                if (this.current instanceof EmptyCard && !Object.is(card, this.current)) {
                    if (confirm('')) this.userCards.remove(this.current); else return
                }
                this.current = card
                this.formRef.$setUntouched()
                this.$location.hash(card instanceof EmptyCard ? 'new' : '')
                this.$scope.$apply()
            })
            this.$scope.$on('advertPreview:deleteAccept', async (e, [card]) => {
                await this.advertismentsService.delete(card.id)
                this.userCards.remove(card)
                this.current = null
                this.$scope.$digest()
            })
            this.$scope.$on('$locationChangeStart', e => {
                if (this.isNewCardActive) this.addNewCard();
                else if (this.current instanceof EmptyCard) {
                    this.current = null
                    this.userCards.remove(this.current)
                }
            })
            this.$scope.$on('advertPreview:EmptyCard:apply', async (e, [card]) => {
                if(this.formRef.$invalid) {
                    this.formRef.$setSubmitted()
                    return;
                }
                card.creationTime = Date.now().toString()
                card.id = this.md5.createHash(this.UserService.info.id + card.creationTime)
                const { status } = await this.onApplyHandler(e, [card])
                if (status == 201) {
                    e.targetScope.advertPreviewCtrl.isNewCard = false
                    this.$location.hash('')
                    this.$scope.$apply()
                }
            })
            this.$scope.$on('advertPreview:EditAccept', async (e, args) => {
                await this.onApplyHandler(e, args)
                e.targetScope.EditCardCtrl.foo()
                e.targetScope.$digest()
            })
            this.$scope.$on('advertPreview:EmptyCard:delete', (e, [card]) => {
                this.userCards.remove(card)
                this.current = this.userCards[0]
                this.$location.hash('')
                this.editMode = false
            })
        }
    }
}

