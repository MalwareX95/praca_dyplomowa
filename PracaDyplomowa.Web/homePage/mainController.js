
export const signalRClient = ({hubName}) => {
    const connection = $.hubConnection('http://localhost:58895/signalr', { useDefaultPath: false }) 
    return {
        [hubName + 'Connection']: connection,
        [hubName + 'Proxy']: connection.createHubProxy(hubName)
    }
}


export class mainController {
    constructor($scope, UserService, CityService, template){
        Object.assign(this, {user: UserService, cityService: CityService})
        Object.assign(this, signalRClient({hubName: 'citiesHub'}))
        this.citiesHubProxy.on('citiesResult', results => $scope.$evalAsync(() => this.results = results))
        this.template = item => template(item, result => result.map((x, i, array) => `<span class="entry-info">${x}${i == array.length - 1 ? '' : ', '}</span>`).join(''))
        this.results = []
        this.searchedCity = ''
    }

    connectWithServer() 
    {  
        this.citiesHubConnection.start().done(() => {
            this.onChangeHandler = () => this.citiesHubProxy.invoke('cities', this.searchedCity)
            if(this.searchedCity && !this.results.length) this.onChangeHandler()
        })
    }
    
}

