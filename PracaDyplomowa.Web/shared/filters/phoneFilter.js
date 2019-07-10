export const PhoneFormaterFilter = function() {
    return number => {
        number = (number || '').toString();
        return [...Array(3).keys()].map(i => number.substr(i * 3, 3)).join(' ')
    }
}