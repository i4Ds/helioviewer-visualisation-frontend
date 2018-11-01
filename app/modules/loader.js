import Config from '../Config'

/**
 * Load data from timeline API
 * @export timelineData [[Date in ms][value],[Date in ms][value],...]
 * @param {Date} from - Start date for the requested timeline
 * @param {Date} to - End date for the requested timeline
 * @returns {*} Promise (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 */
export const timelineData = (from, to) => {
    let localTimelineDataTimestamp = window.localStorage.getItem('timeline-cache-timestamp')
    let timelineCacheTimestamp = new Date(localTimelineDataTimestamp)
    let cacheTimeout = 1000 * 60 * 60 * 24
    let localTimelineData = window.localStorage.getItem('timeline-json-data')
    let initialData = from === Config.minDate && to === Config.maxDate
    let useLocalData =
        initialData &&
        localTimelineData !== undefined &&
        localTimelineData !== null &&
        localTimelineData.length > window.innerWidth &&
        new Date().getTime() > timelineCacheTimestamp + cacheTimeout

    if (useLocalData) return Promise.resolve(JSON.parse(localTimelineData))

    const url = 'https://heliotime.org/api/?from=' + from + '&to=' + to + '&points=' + 2 * window.innerWidth
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            if (initialData) {
                window.localStorage.setItem('timeline-cache-timestamp', new Date().getTime().toString())
                window.localStorage.setItem('timeline-json-data', JSON.stringify(json))
            }

            return json
        })
}
