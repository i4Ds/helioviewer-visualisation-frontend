import style from './style'

//Modified Link for dynamic sun images:
//full link with options: <img src="https://legacy.helioviewer.org/api/v1/takeScreenshot/?imageScale=4&layers=[SDO,AIA,AIA,304,1,100]&events=&eventLabels=false&scale=false&scaleType=earth&scaleX=0&scaleY=0&date=${timestamp}&x1=-1300&x2=1300&y1=-1300&y2=1300&display=true&watermark=false"
//optimized link: https://legacy.helioviewer.org/api/v1/takeScreenshot/?imageScale=1&layers=[SDO,AIA,AIA,171,10,100]&date=${timestamp}&x1=-1500&x2=1500&y1=-1500&y2=1500&display=true&watermark=false
//Demo Sun image:
//<img src="./media/sun.png"

const SolarImagePreview = (timeParam, timeDisplay, satellite) =>
`<div id="${style.previewContainer}">
<img src="https://legacy.helioviewer.org/api/v1/takeScreenshot/?imageScale=5&layers=[${satellite},171,10,100]&date=${timeParam}&x1=-1600&x2=1600&y1=-1250&y2=1300&display=true&watermark=false"
id="${style.solarImage}">
<img src="././media/alt-solarimage.png" id="${style.solarImageLoading}" alt="Solar Image Loading">
<div class="${style.time}">${timeDisplay}</div>
<div><a class="${style.button}" href="https://helioviewer.org/?date=${timeParam}" target="_blank">View on helioviewer.org</a></div></div>`

export default SolarImagePreview