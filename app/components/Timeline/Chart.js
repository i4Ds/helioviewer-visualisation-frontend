import Highcharts from 'highcharts'
import style from './style'
import { Theme } from './Theme'
import demoDateValues from './demoDateValues'
import { timelineData } from '../../modules/loader'
import SolarImagePreview from 'components/SolarImage'
import Config from '../../Config'
// import boost from 'highcharts/modules/boost'

/**
 * Creates a highchart object
 * @param {string} container - The ID for the highcharts container
 * @returns {*} Highchart element (I think. I have some reading to do...)
 */
Highcharts.theme = Theme
// Apply the theme
Highcharts.setOptions(Highcharts.theme)

var labelFluxXPosition = -20

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

    if (event && "undefined" !== typeof event.userMin) {
        fromDate = Math.floor(event.userMin)
        toDate = Math.ceil(event.userMax)

        let difference = toDate.valueOf() - fromDate.valueOf();

        if (difference < Config.minRange) {
            let differenceFix = (Config.minRange - difference) / 2;
            fromDate = Math.floor(fromDate - differenceFix);
            toDate = Math.floor(toDate + differenceFix);
        }
    }

    if (!moving) {
        addZoomToStack(fromDate, toDate)
    }

    timelineData(fromDate, toDate).then(data => {
        chart.series[0].setData(data, true)
    }).then(() => {
        loadingData = false
        chart.hideLoading()
    })

}

const isZoomedIn = () => {
    if (fromDateStack.length == 0 && toDateStack.length == 0) {
        return false
    }
    return true
}

const addZoomToStack = (from, to) => {
    fromDateStack.push(from)
    toDateStack.push(to)
}

const removeZoomFromStack = () => {
    fromDateStack.pop()
    toDateStack.pop()
    return [
        fromDateStack.pop(),
        toDateStack.pop()
    ]
}

const resetZoom = () => {
    if (!isZoomedIn() || loadingData) {
        return false
    }

    if (fromDateStack.length > 1) {
        [fromDate, toDate] = removeZoomFromStack()
    } else {
        fromDate = Config.minDate
        toDate = Config.maxDate
        fromDateStack = []
        toDateStack = []
    }

    chart.xAxis[0].setExtremes(fromDate, toDate, true)

    return false
}

const moveBack = () => {
    if (loadingData) {
        return false
    }

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
    if (loadingData) {
        return false
    }

    if (!isZoomedIn()) {
        alert('Cannot move forward when zoomed out!')
        return false
    }

    let zoom = toDate - fromDate
    zoom -= zoom * 0.2

    toDate += zoom
    fromDate += zoom

    if (toDate > Config.maxDate) {
        alert('Cannot move forward anymore because there is no more data available, try to zoom in and then move forward.')
        return false
    }

    moving = true
    chart.xAxis[0].setExtremes(fromDate, toDate, true)
    moving = false

    return false
}

const Chart = (container, resetElementID, moveBackElementID, moveForwardElementID) => {
    document.getElementById(resetElementID).onclick = resetZoom
    document.getElementById(moveBackElementID).onclick = moveBack
    document.getElementById(moveForwardElementID).onclick = moveForward

    return timelineData(fromDate, toDate).then(data =>
        chart = Highcharts.chart(container, {
            chart: {
                animation: false,
                height: 400,
                zoomType: 'x',
                marginLeft: 120,
                marginRight: 10,
                zoomType: 'x',
                resetZoomButton: {
                    theme: {
                        display: 'none'
                    },
                },
            },
            tooltip: {
                enabled: false,
                crosshairs: {
                    color: 'green',
                    dashStyle: 'solid'
                },

                shared: true
            },
            xAxis: {
                minRange: Config.minRange,
                events: {
                    afterSetExtremes: afterSetExtremes
                },
                type: 'datetime',
                dateTimeLabelFormats: {
                    /*
             *  millisecond: '%H:%M:%S.%L',
             * second: '%H:%M:%S',
             * minute: '%H:%M',
             * hour: '%H:%M',
             * day: '%d    .%m.%Y',
             * week: '%m.%Y',
             * month: '%m\'%Y',
             *year: '%Y'
             */
                },
                labels: {
                    style: {
                        fontSize: Config.labelFontSize,
                    },
                },
            },
            title: {
                text: 'Solar Activity Timeline',
            },
            yAxis: {
                type: 'logarithmic',
                min: 0.000000009,
                /*
             *additional horizontal dividers in chart
             *minorTickInterval: 0.1,
             */
                title: {
                    text: 'X-ray Flux',
                    x: 0,
                    style: {
                        fontSize: '14pt',
                    },
                },
                labels: {
                    x: -40,
                    formatter: function () {
                        let label = this.axis.defaultLabelFormatter.call(this),
                            base = "10",
                            exponent,
                            decimals;

                        if (label.toString().includes(".")) {
                            decimals = label.split(".")[1].length || 0;
                            exponent = ("-" + decimals).sup();
                        } else {
                            decimals = label.split("e")[1];
                            exponent = decimals.sup();
                        }

                        return base + exponent;
                    },
                    style: {
                        fontSize: Config.labelFontSize,
                    },
                    useHTML: true,  //useHTML must be true for <sup></sup> tag to work!
                },
                gridLineWidth: 1,
                tickLength: 35,
                plotBands: [
                    {
                        // A-Flare
                        from: 0.0000001,
                        to: 0.00000001,
                        color: 'rgba(40, 40, 40, 40)',
                        borderwidth: '100',
                        borderColor: '#FFFF',
                        label: {
                            text: 'A',
                            x: labelFluxXPosition,
                            style: {
                                color: Config.labelColor,
                                fontWeight: 'bold',
                                fontSize: Config.labelFontSize,
                            },
                        },
                    },
                    {
                        // B-Flare
                        from: 0.000001,
                        to: 0.0000001,
                        color: 'rgba(0, 0, 0, 0)',
                        label: {
                            text: 'B',
                            x: labelFluxXPosition,
                            style: {
                                color: Config.labelColor,
                                fontWeight: 'bold',
                                fontSize: Config.labelFontSize,
                            },
                        },
                    },
                    {
                        // C-Flare
                        from: 0.00001,
                        to: 0.000001,
                        color: 'rgba(40, 40, 40, 40)',
                        label: {
                            text: 'C',
                            x: labelFluxXPosition,
                            style: {
                                color: Config.labelColor,
                                fontWeight: 'bold',
                                fontSize: Config.labelFontSize,
                            },
                        },
                    },
                    {
                        // M-Flare
                        from: 0.0001,
                        to: 0.00001,
                        // zIndex: 5,
                        color: 'rgba(0, 0, 0, 0)',
                        label: {
                            text: 'M',
                            x: labelFluxXPosition,
                            style: {
                                color: Config.labelColor,
                                fontWeight: 'bold',
                                fontSize: Config.labelFontSize,
                            },
                        },
                    },
                    {
                        // X-Flare
                        from: 0.001,
                        to: 0.0001,
                        color: 'rgba(40, 40, 40, 40)',
                        label: {
                            text: 'X',
                            x: labelFluxXPosition,
                            style: {
                                color: Config.labelColor,
                                fontWeight: 'bold',
                                fontSize: Config.labelFontSize,
                            },
                        },
                    },
                ],
            },
            plotOptions: {
                series: {
                    name: "X-ray Flux",
                    allowPointSelect: true,
                    cursor: 'pointer',
                    linewidth: 2,
                    states: {
                        hover: {
                            lineWidthPlus: 0,
                        }
                    },
                    point: {
                        events: {
                            click: function (event) {
                                /*
                                 alert(
                                     'Date: ' +
                                         Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ\n', this.x) +
                                         'Value: ' +
                                         this.y
                                 ) */
                                if (Highcharts.dateFormat('%Y', this.x) < 2010) {
                                    document.getElementById('preview').innerHTML = SolarImagePreview(Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x), Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SOHO', this.x), 'SOHO,EIT,EIT')
                                } else {
                                    document.getElementById('preview').innerHTML = SolarImagePreview(Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x), Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SDO ', this.x), 'SDO,AIA,AIA')
                                }
                            },
                        },
                    },
                    // lineWidth: 0.7,
                },
            },
            series: [
                {
                    showInLegend: false,
                    data
                },
            ],
        })
    )
}

export default Chart
