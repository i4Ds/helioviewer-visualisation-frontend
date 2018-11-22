import style from './style'
import solarImageLoading from '../../media/alt-solarimage.jpg'

const SolarImagePreview = (timeParam, timeDisplay, satellite) => {
    return `<div class="${style.previewContainer}">
        <div class="${style.solarImageContainer}">
        <div class="${style.flexContainer}">
            <img src="https://legacy.helioviewer.org/api/v1/takeScreenshot/?imageScale=5&layers=[${satellite},171,10,100]&date=${timeParam}&x1=-1600&x2=1600&y1=-1250&y2=1300&display=true&watermark=false"
                id="${style.solarImage}" alt="Solar Image">
            <img src="${solarImageLoading}" id="${style.solarImageLoading}" alt="Solar Image Loading">
        </div>
        </div>
        <div class="${style.time}">${timeDisplay}</div>
        <a class="${
            style.button
        }" href="https://helioviewer.org/?date=${timeParam}&imageScale=2&imageLayers=%5B${satellite},171,1,100,0,60,1,${timeParam}" target="_blank" rel="noopener">View on helioviewer.org</a>
    </div>`
}

export default SolarImagePreview
