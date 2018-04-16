// @todo implementation

/**
 * Load data from timeline API
 * @export timelineData [[Date in ms][value],[Date in ms][value],...]
 * @param {Date} from - Start date for the requested timeline
 * @param {Date} to - End date for the requested timeline
 * @returns {*} Promise (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 */

export const timelineData = (from, to) => {
    const url = 'http://localhost:8080/api?from=' + from + '&to=' + to + '&points=' + 5000

    return fetch(url)
        .then(response => response.json())
        .then(json => json)
}