import Highcharts from 'highcharts/js/highcharts'
import Exporting from 'highcharts/modules/exporting'
import { timelineData } from '../../modules/loader'
import SolarImagePreview from 'components/SolarImage'
import Config from '../../Config'

Exporting(Highcharts)

const labelFluxXPosition = -25

const timelineWidth = 1
const timelineHeight = 0.5

let chart
let timeline
let moving = false
let loadingData = false
let fromDate = Config.minDate
let toDate = Config.maxDate

// use two stacks to save zoom boundary history
let fromDateStack = []
let toDateStack = []

// credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml
const swipedetect = (el, callback) => {
    let touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 50, // required min distance traveled to be considered swipe
        restraint = 100, // maximum distance allowed at the same time in perpendicular direction
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime,
        defaultCallback = swipedir => {},
        handleswipe = callback || defaultCallback,
        multitouch = false

    touchsurface.addEventListener(
        'touchstart',
        e => {
            let touchobj = e.changedTouches[0]
            swipedir = 'none'
            startX = touchobj.pageX
            startY = touchobj.pageY
            startTime = new Date().getTime() // record time when finger first makes contact with surface
            if (e.touches.length != 1) multitouch = true
            else multitouch = false
        },
        false
    )

    touchsurface.addEventListener(
        'touchmove',
        e => {
            e.preventDefault() // prevent scrolling when inside DIV
        },
        false
    )

    touchsurface.addEventListener(
        'touchend',
        e => {
            const touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
            distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
            elapsedTime = new Date().getTime() - startTime // get time elapsed
            if (elapsedTime <= allowedTime && !multitouch)
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                    /*
                     * first condition for awipe met
                     * 2nd condition for horizontal swipe met
                     */
                    swipedir = distX < 0 ? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
                    e.preventDefault()
                } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
                    // 2nd condition for vertical swipe met
                    swipedir = distY < 0 ? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                    e.preventDefault()
                }

            handleswipe(swipedir)
        },
        false
    )
}

const afterSetExtremes = event => {
    loadingData = true
    if (chart !== undefined && chart !== null) chart.showLoading('Loading data from server...')

    if (event && 'undefined' !== typeof event.userMin) {
        fromDate = Math.floor(event.userMin)
        toDate = Math.ceil(event.userMax)

        let difference = toDate.valueOf() - fromDate.valueOf()

        if (difference < Config.minRange) {
            let differenceFix = (Config.minRange - difference) / 2
            fromDate = Math.floor(fromDate - differenceFix)
            toDate = Math.floor(toDate + differenceFix)
        }
    }

    if (!moving) addZoomToStack(fromDate, toDate)

    timelineData(fromDate, toDate)
        .then(data => {
            chart.series[0].setData(data, true)
        })
        .then(() => {
            loadingData = false
            chart.hideLoading()
        })
}

const isZoomedIn = () => {
    return !(fromDateStack.length === 0 && toDateStack.length === 0)
}

const addZoomToStack = (from, to) => {
    fromDateStack.push(from)
    toDateStack.push(to)
}

const removeZoomFromStack = () => {
    fromDateStack.pop()
    toDateStack.pop()
    return [fromDateStack.pop(), toDateStack.pop()]
}

const resetZoom = () => {
    if (!isZoomedIn() || loadingData) return false

    if (fromDateStack.length > 1) [fromDate, toDate] = removeZoomFromStack()
    else {
        fromDate = Config.minDate
        toDate = Config.maxDate
        fromDateStack = []
        toDateStack = []
    }

    chart.xAxis[0].setExtremes(fromDate, toDate, true)

    return false
}

const moveBack = () => {
    if (loadingData) return false

    if (!isZoomedIn()) {
        alert('Cannot move back when zoomed out!')
        return false
    }

    let zoom = toDate - fromDate
    zoom -= zoom * 0.2

    toDate -= zoom
    fromDate -= zoom

    if (fromDate < Config.minDate) {
        alert('Cannot move back anymore because there is no more data available, try to zoom in and then move back.')
        return false
    }
    moving = true
    chart.xAxis[0].setExtremes(fromDate, toDate, true)
    moving = false

    return false
}

const moveForward = () => {
    if (loadingData) return false

    if (!isZoomedIn()) {
        alert('Cannot move forward when zoomed out!')
        return false
    }

    let zoom = toDate - fromDate
    zoom -= zoom * 0.2

    toDate += zoom
    fromDate += zoom

    if (toDate > Config.maxDate) {
        alert(
            'Cannot move forward anymore because there is no more data available, try to zoom in and then move forward.'
        )
        return false
    }

    moving = true
    chart.xAxis[0].setExtremes(fromDate, toDate, true)
    moving = false

    return false
}

const Chart = container => {
    return timelineData(fromDate, toDate).then(
        data =>
            (chart = Highcharts.chart(container, {
                chart: {
                    animation: false,
                    width: window.innerWidth * timelineWidth,
                    height: window.innerHeight * timelineHeight,
                    marginLeft: 120,
                    marginRight: 10,
                    zoomType: 'x',
                    events: {
                        load: event => {
                            timeline = document.getElementById('timeline')

                            swipedetect(timeline, swipedir => {
                                if (swipedir === 'left') {
                                    moveForward()
                                    return
                                }

                                if (swipedir === 'right') {
                                    moveBack()
                                    return
                                }
                            })

                            window.onresize = () => {
                                let width = window.innerWidth * timelineWidth
                                let height = window.innerHeight * timelineHeight

                                if (chart === undefined || chart === null) return

                                chart.setSize(width, height, true)
                            }
                        },
                    },
                },
                tooltip: {
                    crosshairs: [true, false],
                    enabled: false,
                    shared: true,
                },
                xAxis: {
                    minRange: Config.minRange,
                    events: {
                        afterSetExtremes,
                    },
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%b %d \'%y',
                        week: '%b %d \'%y',
                        month: '%b \'%y',
                        year: '%Y',
                    },
                },
                title: {
                    text: 'Solar Activity Timeline',
                },
                yAxis: {
                    type: 'logarithmic',
                    min: 0.000000009,
                    title: {
                        text: 'X-ray Flux',
                        x: 0,
                    },
                    labels: {
                        x: -45,
                        formatter() {
                            let label = this.axis.defaultLabelFormatter.call(this),
                                base = '10',
                                exponent,
                                decimals

                            if (label.toString().includes('.')) {
                                decimals = label.split('.')[1].length || 0
                                exponent = ('-' + decimals).sup()
                            } else {
                                decimals = label.split('e')[1]
                                exponent = decimals.sup()
                            }

                            return base + exponent
                        },
                        useHTML: true,
                    },
                    gridLineWidth: 1,
                    tickLength: 35,
                    tickInterval: 1,
                    plotBands: [
                        {
                            // A-Flare
                            from: 0.0000001,
                            to: 0.00000001,
                            className: 'heliotime-flare-a',
                            label: {
                                text: 'A',
                                x: labelFluxXPosition,
                            },
                        },
                        {
                            // B-Flare
                            from: 0.000001,
                            to: 0.0000001,
                            className: 'heliotime-flare-b',
                            label: {
                                text: 'B',
                                x: labelFluxXPosition,
                            },
                        },
                        {
                            // C-Flare
                            from: 0.00001,
                            to: 0.000001,
                            className: 'heliotime-flare-c',
                            label: {
                                text: 'C',
                                x: labelFluxXPosition,
                            },
                        },
                        {
                            // M-Flare
                            from: 0.0001,
                            to: 0.00001,
                            className: 'heliotime-flare-m',
                            label: {
                                text: 'M',
                                x: labelFluxXPosition,
                            },
                        },
                        {
                            // X-Flare
                            from: 0.001,
                            to: 0.0001,
                            className: 'heliotime-flare-x',
                            label: {
                                text: 'X',
                                x: labelFluxXPosition,
                            },
                        },
                    ],
                },
                plotOptions: {
                    series: {
                        name: 'X-ray Flux',
                        allowPointSelect: true,
                        cursor: 'pointer',
                        linewidth: 2,
                        states: {
                            hover: {
                                lineWidthPlus: 0,
                            },
                        },
                        animation: {
                            duration: 1200,
                            easing: 'swing',
                        },
                        point: {
                            events: {
                                select() {
                                    if (Highcharts.dateFormat('%Y', this.x) < 2010)
                                        document.getElementById('preview').innerHTML = SolarImagePreview(
                                            Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x),
                                            Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Spacecraft: SOHO', this.x),
                                            'SOHO,EIT,EIT'
                                        )
                                    else
                                        document.getElementById('preview').innerHTML = SolarImagePreview(
                                            Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x),
                                            Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Spacecraft: SDO ', this.x),
                                            'SDO,AIA,AIA'
                                        )
                                },
                            },
                        },
                    },
                },
                series: [
                    {
                        showInLegend: false,
                        data,
                    },
                ],
                exporting: {
                    buttons: [
                        {
                            text: 'Zoom Out',
                            className: 'reset-zoom',
                            onclick() {
                                resetZoom()
                            },
                        },
                        {
                            text: '--->',
                            className: 'move-forward',
                            onclick() {
                                moveForward()
                            },
                        },
                        {
                            text: '<---',
                            classname: 'move-back',
                            onclick() {
                                moveBack()
                            },
                        },
                    ],
                },
            }))
    )
}

export default Chart
