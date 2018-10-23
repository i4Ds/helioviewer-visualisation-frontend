import Config from '../Config'

/**
 * Load data from timeline API
 * @export timelineData [[Date in ms][value],[Date in ms][value],...]
 * @param {Date} from - Start date for the requested timeline
 * @param {Date} to - End date for the requested timeline
 * @returns {*} Promise (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 */
export const timelineData = (from, to) => {
    let localTimelineData = window.localStorage.getItem('timeline-json-data')
    let initialData = from === Config.minDate && to === Config.maxDate
    let useLocalData = initialData && localTimelineData !== undefined && localTimelineData !== null

    if (useLocalData) return Promise.resolve(JSON.parse(localTimelineData))

    console.log('before assigning url')

    const url = 'http://147.86.8.82/api/?from=' + from + '&to=' + to + '&points=' + 2 * window.innerWidth
    console.log('server data: ' + url)
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            if (initialData) window.localStorage.setItem('timeline-json-data', JSON.stringify(json))

            return json
        })
}
