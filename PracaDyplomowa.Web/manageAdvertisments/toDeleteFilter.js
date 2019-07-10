export const filter = function(){
    return (collection, item) => {
        if(!(item == null || collection.indexOf(item) == -1)) {
            collection.splice(collection.indexOf(item), 1)
        }
        return collection
    }
}