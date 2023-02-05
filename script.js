let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest()

let baseTemp
let data = []

let xScale
let yScale

let minYear
let maxYear
let numOfYears = maxYear - minYear

let width = 1200
let height = 600
let padding = 60

let svg = d3.select('#canvas')
svg.attr('width', width)
svg.attr('height', height)

let tooltip = d3.select('#tooltip')

let generateScales = () => {

    minYear = d3.min(data, (d) => d['year'])

    maxYear = d3.max(data, (d) => d['year'])

    xScale = d3.scaleLinear()
                .domain([minYear, maxYear + 1])
                .range([padding, width - padding])

    yScale = d3.scaleTime()
                .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
                .range([padding, height - padding])

}

let drawCells = () => {

    svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('fill',  (d) => {
        variance = d['variance']
        if (variance <= -1){
            return 'SteelBlue'
        } else if (variance <= 0) {
            return 'lightSteelBlue'
        } else if (variance <= 1) {
            return 'orange'
        } else {
            return 'Crimson'
        }
    })
    .attr('data-year', (d)=>{
        return d['year']
    })
    .attr('data-month', (d)=>{
        return d['month'] - 1
    })
    .attr('data-temp', (d)=>{
        return baseTemp + d['variance']
    })
    .attr('height', (height - (2 * padding)) / 12)
    .attr('y', (d) => {
        return yScale(new Date(0, d['month'] - 1, 0, 0, 0, 0, 0))
    })
    .attr('width', (d) => {
        let numOfYears = maxYear - minYear
        return (width - (2 * padding)) / numOfYears
    })
    .attr('x', (d) =>{
        return xScale(d['year'])
    })
    .on('mouseover', (d) => {
        tooltip.transition()
                .style('visibility', 'visible')

        tooltip.text(`Temperature: ${baseTemp + d['variance']}\nDate: ${d['month']}/${d['year']}`)

        tooltip.attr('data-year', d['year'])
    })
    .on('mouseout', (d) => {
        tooltip.transition()
                .style('visibility', 'hidden')
    })
}

let drawAxes = () => {

    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('d'))

    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))

    svg.append('g')
            .call(xAxis)
            .attr('transform', 'translate(0, ' + (height - padding) + ')')
            .attr('id', 'x-axis')

    svg.append('g')
            .call(yAxis)
            .attr('transform', 'translate(' + padding + ', 0)')
            .attr('id', 'y-axis')
}

req.open('GET', url, true)
req.onload = () => {
    let object = JSON.parse(req.responseText)
    baseTemp = object['baseTemperature']
    data = object['monthlyVariance']
    generateScales()
    drawCells()
    drawAxes()
}
req.send()