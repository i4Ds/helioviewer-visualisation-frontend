import Highcharts from 'highcharts'
import style from './style'
import { Theme } from './Theme'
import demoDateValues from './demoDateValues'
import { timelineData } from '../../modules/loader'
import SolarImagePreview from 'components/SolarImage'
// import boost from 'highcharts/modules/boost'

// boost(Highcharts)


/**
 * Creates a highchart object
 * @param {string} container - The ID for the highcharts container
 * @returns {*} Highchart element (I think. I have some reading to do...)
 */
Highcharts.theme = Theme
// Apply the theme
Highcharts.setOptions(Highcharts.theme)

const labelFontSize = '11pt'
const labelColor = '#E0E0E3'
var labelFluxXPosition = -20

let chart

const minDate = 1009843200000
const maxDate = new Date().getTime()
let fromDate = minDate
let toDate = maxDate

// use two stacks to save zoom boundary history 
let fromDateStack = [fromDate]
let toDateStack = [toDate]


const afterSetExtremes = event => {
    chart.showLoading('Loading data from server...')

    if (event && "undefined" !== typeof event.userMin) {
        fromDate = Math.floor(event.userMin)
        toDate = Math.ceil(event.userMax)
    }

    fromDateStack.push(fromDate)
    toDateStack.push(toDate)

    timelineData(fromDate, toDate).then(data => {
        chart.series[0].setData(data, true)
    }).then(() => {
        chart.hideLoading()
    })
}



const resetZoom = () => {
    if (1 < fromDateStack.length) {
        fromDateStack.pop()
        toDateStack.pop()
        fromDate = fromDateStack.pop()
        toDate = toDateStack.pop()
    } else {
        fromDate = minDate
        toDate = maxDate
    }

    chart.xAxis[0].setExtremes(fromDate, toDate, true)

    return false
}



const Chart = (container, resetElementID) => {
    document.getElementById(resetElementID).onclick = resetZoom

    return timelineData(fromDate, toDate).then(data =>
        chart = Highcharts.chart(container, {
            chart: {
                animation: false,
                height: 300,
                zoomType: 'x',
                marginLeft: 150,
                resetZoomButton: {
                    theme: {
                        display: 'none'
                    },
                },
            },
            tooltip: {
                enabled:false,
                crosshairs: {
                    color: 'green',
                    dashStyle: 'solid'
                },
            
                shared: true
            },
            xAxis: {
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
                        fontSize: labelFontSize,
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
                        fontSize: labelFontSize,
                    },
                    useHTML: true,  //useHTML must be true for <sup></sup> tag to work!
                },
                gridLineWidth: 1,
                tickLength: 35,
                plotBands: [
                    {
                        // A-Flare
                        from: 0,
                        to: 0.0000001,
                        color: 'rgba(40, 40, 40, 40)',
                        borderwidth: '100',
                        borderColor: '#FFFF',
                        label: {
                            text: 'A',
                            x: labelFluxXPosition,
                            style: {
                                color: labelColor,
                                fontWeight: 'bold',
                                fontSize: labelFontSize,
                            },
                        },
                    },
                    {
                        // B-Flare
                        from: 0.0000001,
                        to: 0.000001,
                        color: 'rgba(0, 0, 0, 0)',
                        label: {
                            text: 'B',
                            x: labelFluxXPosition,
                            style: {
                                color: labelColor,
                                fontWeight: 'bold',
                                fontSize: labelFontSize,
                            },
                        },
                    },
                    {
                        // C-Flare
                        from: 0.000001,
                        to: 0.00001,
                        color: 'rgba(40, 40, 40, 40)',
                        label: {
                            text: 'C',
                            x: labelFluxXPosition,
                            style: {
                                color: labelColor,
                                fontWeight: 'bold',
                                fontSize: labelFontSize,
                            },
                        },
                    },
                    {
                        // M-Flare
                        from: 0.00001,
                        to: 0.0001,
                        // zIndex: 5,
                        color: 'rgba(0, 0, 0, 0)',
                        label: {
                            text: 'M',
                            x: labelFluxXPosition,
                            style: {
                                color: labelColor,
                                fontWeight: 'bold',
                                fontSize: labelFontSize,
                            },
                        },
                    },
                    {
                        // X-Flare
                        from: 0.0001,
                        to: 1000000000,
                        color: 'rgba(40, 40, 40, 40)',
                        label: {
                            text: 'X',
                            x: labelFluxXPosition,
                            style: {
                                color: labelColor,
                                fontWeight: 'bold',
                                fontSize: labelFontSize,
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
                                    document.getElementById('preview').innerHTML = SolarImagePreview(Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x), Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SOHO', this.x, ), 'SOHO,EIT,EIT')
                                } else {
                                    document.getElementById('preview').innerHTML = SolarImagePreview(Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', this.x), Highcharts.dateFormat('%Y/%m/%d %H:%M:%S UTC - Satellite: SDO ', this.x, ), 'SDO,AIA,AIA')
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
