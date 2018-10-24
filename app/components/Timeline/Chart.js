import Highcharts from 'highcharts/js/highcharts'
import Exporting from 'highcharts/modules/exporting'
import { timelineData } from '../../modules/loader'
import SolarImagePreview from 'components/SolarImage'
import Config from '../../Config'

Exporting(Highcharts)

const labelFluxXPosition = -25

let chart
let moving = false
let loadingData = false
let fromDate = Config.minDate
let toDate = Config.maxDate

// use two stacks to save zoom boundary history
let fromDateStack = []
let toDateStack = []

const afterSetExtremes = event => {
    loadingData = true
    chart.showLoading('Loading data from server...')

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
                    height: 500,
                    marginLeft: 120,
                    marginRight: 10,
                    zoomType: 'x',
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
                    dateTimeLabelFormats: {},
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
                                click() {
                                    if (Highcharts.dateFormat('%Y', this.x) < 2010)
                                        document.getElementById('preview').innerHTML = SolarImagePreview(
                                            Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x),
                                            Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SOHO', this.x),
                                            'SOHO,EIT,EIT'
                                        )
                                    else
                                        document.getElementById('preview').innerHTML = SolarImagePreview(
                                            Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x),
                                            Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SDO ', this.x),
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
                            onclick() {
                                resetZoom()
                            },
                        },
                        {
                            text: '>',
                            onclick() {
                                moveForward()
                            },
                        },
                        {
                            text: '<',
                            onclick() {
                                moveBack()
                            },
                        },
                    ],
                },
                responsive: {
                    rules: [
                        {
                            condition: {
                                maxWidth: 500,
                            },
                            chartOptions: {
                                chart: {
                                    height: 300,
                                    marginLeft: 100,
                                    marginRight: 5,
                                },
                            },
                        },
                    ],
                },
            }))
    )
}

export default Chart
