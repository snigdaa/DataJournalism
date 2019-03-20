//make global xscale and yscale values so you can access the values in
//the changeaxes functions
var xScale = d3.scaleLinear().domain([0,1]).range([0,1]);
var yScale = d3.scaleLinear().domain([0,1]).range([0,1]);

//define the global dict which we only populate once we read in the csv
//also to use in changeaxes funcs
//only contains keys we're interested in, not all from csv
//age, healthcare, income, obesity, poverty, smokes, state
var totDict = [];

//define the circles and circle labels we create globally so we can 
//just transition in changeaxes funcs
var circles;
var circleTexts;

//create fluid variables to decide what is being displayed on the graph
//and to keep tooltip updated as well
//modify these values in beginning of makeResponsive()
//and again in changeaxes funcs. 
var yTitle = "", yVal = "";
var xTitle = "", xVal = "";

//create a global "how much we are adding on the sides of axes" variable
//mainly to account for income, as we need ~1000 on both sides of x axis
//while we only need 1 for the other two cats
var extentAdd = 1;

//define svg area globally
var svgWidth = window.innerWidth - 300;
var svgHeight = window.innerHeight;

//define chart margins globally
var chartMargin = {
    top: 10,
    right: 30,
    bottom: 50,
    left: 60
};

//define chart area dimensions globally
    //subtract margins from total svg width
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight -chartMargin.top - chartMargin.bottom;


//FUNCTION TO UPDATE Y AXIS AFTER A CLICK
//CALLED IN ONCLICK BUTTONS FOR AXES
function changeYAxis(axisName) {
    //assign the full data array of dicts to temporary variable
    //so we don't damage data
    var tempDict = totDict;

    //determine which axis was clicked and assign necessary variables
    if(axisName === "Obese") {
        console.log("Obese (%)");

        yVal = "obesity";
        extentAdd = 2;
        yTitle = "Obese (%): ";
    }
    else if(axisName === "Smokes") {
        console.log("Smokes (%)");
        yVal = "smokes";
        extentAdd = 3;
        yTitle = "Smokes (%): ";
    }
    else {
        console.log("Lacks Healthcare (%)");
        yVal = "healthcare";
        extentAdd = 1;
        yTitle = "Lacks Healthcare (%): ";
    }

    //modify the xscale
    yScale = d3.scaleLinear()
        .domain([d3.min(tempDict, d => d[yVal])-extentAdd, d3.max(tempDict, d => d[yVal])+extentAdd])
        .range([chartHeight - chartMargin.bottom, 0]);
    
    //make the axis to call
    var y = d3.axisLeft(yScale).ticks(10);

    //xaxis element
    var yaxis = document.getElementsByClassName("yAxis");
    //update the x axis
    d3.selectAll(yaxis)
        .transition()
        .duration(500)
        .attr("class", "yAxis")
        .attr("transform",`translate(${chartMargin.left}, 0)`)
        .call(y);   

    //update the circles cx
    circles
        .data(tempDict)
        .transition()
        .duration(500)
        .attr("cy", d => yScale(d[yVal]))  

    //update the labels on the circles
    circleTexts
        .transition()
        .duration(500)
        .attr("y", d => yScale(d[yVal]))
    
    console.log(tempDict);
}

//FUNCTION TO UPDATE X AXIS AFTER A CLICK
//CALLED IN ONCLICK BUTTONS FOR AXES
function changeXAxis(axisName) {
    //assign the full data array of dicts to temporary variable
    //so we don't damage data
    var tempDict = totDict;

    //determine which axis was clicked and assign necessary variables
    if(axisName === "In") {
        console.log("In Poverty (%)");

        xVal = "poverty";
        extentAdd = 1;
        xTitle = "In Poverty (%): ";
    }
    else if(axisName === "Age") {
        console.log("Age (Median)");
        xVal = "age";
        extentAdd = 1;
        xTitle = "Age (Median): ";
    }
    else {
        console.log("Household Income (Median)");
        xVal = "income";
        extentAdd = 1000;
        xTitle = "Income (Median): ";
    }

    //modify the xscale
    xScale = d3.scaleLinear()
        .domain([d3.min(tempDict, d => d[xVal])-extentAdd, d3.max(tempDict, d => d[xVal])+extentAdd])
        .range([chartMargin.left,chartWidth]);
    
    //make the axis to call
    var x = d3.axisBottom(xScale).ticks(10);

    //xaxis element
    var xaxis = document.getElementsByClassName("xAxis");
    //update the x axis
    d3.selectAll(xaxis)
        .transition()
        .duration(500)
        .attr("class", "xAxis")
        .attr("transform",`translate(0, ${chartHeight - chartMargin.bottom})`)
        .call(x);   

    //update the circles cx
    circles
        .data(tempDict)
        .transition()
        .duration(500)
        .attr("cx", d => xScale(d[xVal]))  

    //update the labels on the circles
    circleTexts
        .transition()
        .duration(500)
        .attr("x", d => xScale(d[xVal]))
    
    console.log(tempDict);
}

//START OF MAKERESPONSIVE FUNCTION (MAIN)
function makeResponsive() {
    xTitle = "In Poverty (%): "
    xVal = "poverty"
    yTitle = "Lacks Healthcare (%): "
    yVal = "healthcare"
    extentAdd = 1;

    //delete any existing svg
    var svg = d3.select("body").select("svg");
    if(!svg.empty()) {
        svg.remove()
    }

    //select scatter plot area and append an svg to it with dimensions we've defined
    var svgArea = d3
        .select("#scatter")
        .append("svg").attr("class","scatterSVG")
        .attr("height",svgHeight)
        .attr("width",svgWidth);

    //make a group that you put in the svg area and translate it to fit in the margins
    var chartGroup = svgArea.append("g").attr("class","masterGroup")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    //load the data
    d3.csv("./assets/data/data.csv").then(function(totData) {
        //make all num strings into numbers, and push the data we're interested in to our global arrays
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
            totDict.push({"age":data.age, "healthcare": data.healthcare, "income": data.income, "obesity": data.obesity,
                "poverty": data.poverty, "smokes": data.smokes, "state":data.state});
        //end totData.forEach below
        })
        
        //make a yaxis linear yscale
        yScale = d3.scaleLinear()
            .domain([d3.min(totData, d => d[yVal])-extentAdd, d3.max(totData, d => d[yVal])+extentAdd])
            .range([chartHeight - chartMargin.bottom, 0]);

        //make an xaxis linear xscale
        xScale = d3.scaleLinear()
            .domain([d3.min(totData, d => d[xVal])-extentAdd, d3.max(totData, d => d[xVal])+extentAdd])
            .range([chartMargin.left,chartWidth]);

        //use d3 functions to pass in our scales
        var bottomAxis = d3.axisBottom(xScale).ticks(10);
        var leftAxis = d3.axisLeft(yScale).ticks(10);

        //append the axes to svg groups
        //yaxis position
        chartGroup.append("g")
            .attr("class","yAxis")
            .attr("transform", `translate(${chartMargin.left}, 0)`)
            .call(leftAxis);
        //xaxis position
        chartGroup.append("g")
            .attr("class","xAxis")
            .attr("transform",`translate(0, ${chartHeight - chartMargin.bottom})`)
            .call(bottomAxis);
        
        //set up tooltips then create it in svg
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8,0])
            .html(function(d) {
                return `${d.state}<br />${xTitle}${d[xVal]}<br />${yTitle}${d[yVal]}`;
            });
        svgArea.call(toolTip);

        //create one svg circle per piece of totData
        circles = chartGroup.selectAll("circle")
            .data(totData)
            .enter().append("circle")
            .attr("class", "stateCircle")
            .attr("r",10)
            .attr("cx", d => xScale(d[xVal]))
            .attr("cy", d => yScale(d[yVal]))
            .on("mouseover", toolTip.show)
            .on("mouseout", toolTip.hide);

        //add labels to each circle        
        circleTexts = chartGroup.selectAll("text")
            .data(totData)
            .enter().append("text").attr("class","stateText")
            .attr("x", d => xScale(d[xVal]))
            .attr("y", d => yScale(d[yVal]))
            .text(d => d.abbr)
        
        //append a group for x axis label(s)
        var xlabels = chartGroup.append("g")
            .attr("class","xlabels")
        
        //create the x axis labels
        var multiXlabels = xlabels.selectAll("text")
            .data(["In Poverty (%)", "Age (Median)", "Household Income (Median)"])
            .enter().append("g").attr("class", `xlabel`)
            .attr("onclick", function(d) {
                var stripped = d.split(" ");
                return `changeXAxis("${stripped[0]}")`;
            })
            .append("text")
            .attr("class","aText")
            .attr("transform", function(d,i) {
                return `translate(${svgWidth/2}, ${chartHeight - 10 + i*25})`
            })
            .style("text-anchor","middle")
            .text(d => d)

        //append a group for the y axis labels
        var ylabels = chartGroup.append("g").attr("class","ylabels")

        //create yaxis labels
        var multiYlabels = ylabels.selectAll("text")
            .data(["Lacks Healthcare (%)", "Smokes (%)", "Obese (%)"])
            .enter().append("g")
            .attr("class", (d,i) => `ylabel ${i}`)
            .attr("onclick", function(d) {
                var stripped = d.split(" ");
                return `changeYAxis("${stripped[0]}")`;
            })
            .append("text").attr("class", "aText")
            .attr("transform", function(d,i) {
                return `translate(${chartMargin.left - chartMargin.right - i*25 - 10}, ${chartHeight/2}) rotate(-90)`
            })
            .style("text-anchor","middle")
            .text(d => d)

        console.log(totData); 

    //end of d3.csv.then below
    });
    //end of makeResponsive below
}
makeResponsive();

d3.select(window).on("resize", makeResponsive);