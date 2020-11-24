exports.normalize = (val, max, min) => {
    return (val - min) / (max - min)
}

exports.scale = (inputY, yRange, xRange) => {
    const [xMin, xMax] = xRange
    const [yMin, yMax] = yRange
    const percent = (inputY - yMin) / (yMax - yMin)
    const outputX = percent * (xMax - xMin) + xMin
    return outputX
}