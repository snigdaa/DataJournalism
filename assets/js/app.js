
function makeResponsive() {

    //delete any existing svg
    var svg = d3.select("body").select("svg");
    if(!svg.empty()) {
        svg.remove()
    }

    //define svg area
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    //define chart margins
    var chartMargin = {
        top: 30,
        right: 30,
        bottom: 50,
        left: 15
    };

    //define chart area dimensions
        //subtract margins from total svg width
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight -chartMargin.top - chartMargin.bottom;

    //select scatter plot area and append an svg to it with dimensions we've defined
    var svgArea = d3
        .select("#scatter")
        .append("svg")
        .attr("height",svgHeight)
        .attr("width",svgWidth);

    //make a group that you put in the svg area and translate it to fit in the margins
    var chartGroup = svgArea.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    //load the data
    d3.csv("./assets/data/data.csv").then(function(totData) {
        totData.forEach((data) => {
            data.id = +data.id;
            data.age = +data.age;
            data.ageMoe = +data.ageMoe;
            data.healthcare = +data.healthcare;
            data.healthcareHigh = +data.healthcareHigh;
            data.healthcareLow = +data.healthcareLow;
            data.income = +data.income;
            data.incomeMoe = +data.incomeMoe;
            data.obesity = +data.obesity;
            data.obesityLow = +data.obesityLow;
            data.obesityHigh = +data.obesityHigh;
            data.poverty = +data.poverty;
            data.povertyMoe = +data.povertyMoe;
            data.smokes = +data.smokes;
            data.smokesHigh = +data.smokesHigh;
            data.smokesLow = +data.smokesLow;
        //end totData.forEach below
        })
        
        //make a healthcare linear yscale
        var yScale = d3.scaleLinear()
            .domain([d3.min(totData, d => d.healthcare)-1, d3.max(totData, d => d.healthcare)+1])
            .range([chartHeight, 0]);

        //make a poverty linear xscale
        var xScale = d3.scaleLinear()
            .domain([d3.min(totData, d => d.poverty)-1, d3.max(totData, d => d.poverty)+1])
            .range([0,chartWidth]);

        //use d3 functions to pass in our scales
        var bottomAxis = d3.axisBottom(xScale).ticks(10);
        var leftAxis = d3.axisLeft(yScale).ticks(10);

        //append the axes to svg groups
        chartGroup.append("g").call(leftAxis);
        chartGroup.append("g")
            .attr("transform",`translate(0, ${chartHeight})`)
            .call(bottomAxis);
        
        //set up tooltips then create it in svg
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8,0])
            .html(function(d) {
                return `${d.state}<br />Poverty: ${d.poverty}%<br />Obesity: ${d.obesity}%`;
            });
        svgArea.call(toolTip);

        //create one svg circle per piece of totData
        var circles = chartGroup.selectAll("circle")
            .data(totData)
            .enter().append("circle")
            .attr("class", "stateCircle")
            .attr("r",7)
            .attr("cx", d => xScale(d.poverty))
            .attr("cy", d => yScale(d.healthcare))
            .attr("stroke", "#000")
            .attr("fill","lightgreen")
            .on("mouseover", toolTip.show)
            .on("mouseout", toolTip.hide);
        
        chartGroup.append("text")
            .attr("transform", `translate(${svgWidth/2}, ${chartHeight + chartMargin.top})`)
            .style("text-anchor", "middle")
            .text("% in Poverty")


        console.log(totData); 

    //end of d3.csv.then below
    });



    //end of makeResponsive below
}
makeResponsive();

d3.select(window).on("resize", makeResponsive);