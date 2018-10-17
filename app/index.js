import SolarImagePreview from './components/SolarImage'

import TimelineMarkup, { Timeline } from './components/Timeline'

import './theme/highcharts.scss'
import './theme/main.scss'

// Format current date
let timestamp = new Date()
let year = timestamp.getUTCFullYear()
let month = ('0' + (1 + timestamp.getUTCMonth())).substr(-2)
let date = ('0' + timestamp.getUTCDate()).substr(-2)
let hours = ('0' + timestamp.getUTCHours()).substr(-2)
let minutes = ('0' + timestamp.getUTCMinutes()).substr(-2)

let timeParam = year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':00Z'
let timeDisplay = year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ':00 UTC - Satellite: SDO'

document.getElementById('timeline').innerHTML = TimelineMarkup()
document.getElementById('preview').innerHTML = SolarImagePreview(timeParam, timeDisplay, 'SDO,AIA,AIA')

Timeline()
