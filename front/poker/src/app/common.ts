const getTimePartPadding = (timePart: number): string => {
    return String(timePart).padStart(2, '0')
}

const getTimeNowString = (): string => {
    let timestamp = new Date()
    let timestampString = 
        getTimePartPadding(timestamp.getHours()) + ':' + 
        getTimePartPadding(timestamp.getMinutes()) + ':' + 
        getTimePartPadding(timestamp.getSeconds())
    return timestampString
}

export {
    getTimeNowString
}
