import Chart from './Chart'
import style from './style'

/**
 * Timeline component, try to keep all timeline related code here so it can eventually be exported to the helioviewer website
 *
 * @returns {string} The timeline HTML
 */
const TimelineMarkup = () => `<div class="${style.chart}" id="${style.chart}"></div>`
export const Timeline = () => Chart(style.chart)
export default TimelineMarkup
