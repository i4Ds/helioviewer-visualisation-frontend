import Chart from './Chart'
import style from './style'

const zoomBackId = 'zoom-back'
const moveBackId = 'move-back'
const moveForwardId = 'move-forward'

/**
 * Timeline component, try to keep all timeline related code here so it can eventually be exported to the helioviewer website
 *
 * @returns {string} The timeline HTML
 */
const TimelineMarkup = () => `<div class="${style.chart}" id="${style.chart}"></div>`
export const Timeline = () => Chart(style.chart)
export default TimelineMarkup
