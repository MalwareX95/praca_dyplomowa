export const advertismentsFilter = function (filterFilter) {
    return (advertisments, userInputs) => {
        const filterFunction = advertisment => {
            for (const [propertyName, propertyValue] of Object.entries(userInputs)) {
                const advertismentProperty = advertisment[propertyName]
                switch (Object.getPrototypeOf(propertyValue)) {
                    case Object.prototype:
                        if (Object.values(userInputs[propertyName]).some(x => x != null)) {
                            let isValid = (propertyValue.min || 0) <= advertismentProperty && advertismentProperty <= (propertyValue.max || Number.POSITIVE_INFINITY)
                            if (!isValid) return false
                        }
                        break
                    case Array.prototype:
                        const [activeFiltersCount, filterCollection] = propertyValue
                        if (activeFiltersCount > 0 && activeFiltersCount < filterCollection.length) {
                            for (let requiredItemName of filterCollection.filter(x => x.isSelected).map(x => x.name)) {
                                let isContains = Array.isArray(advertismentProperty) ? advertismentProperty.map(x => x.name).includes(requiredItemName) : advertismentProperty == requiredItemName
                                if (!isContains) return false
                            }
                        }
                        break
                }
            }
            return true
        }
        return filterFilter(advertisments, filterFunction)
    }
}