
//NETWORK//

//https://gist.github.com/DavidDeSimone/1a32a97913360c8e181e
//https://gist.github.com/mbostock/4062045
//https://stackoverflow.com/questions/41928319/text-not-showing-as-label-in-d3-force-layout for naming nodes

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

const width = document.querySelector("#network").clientWidth;
const height = document.querySelector("#network").clientHeight;

const nodesize_scaler = .1;
const radius = 10;

console.log(width);
console.log(height);

//create svg container
const svg = d3.select("#network")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.name; }))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
        return d.size/nodesize_scaler
      }));
    //.force('collision', d3.forceCollide().radius(radius));

d3.json("./data/graph.json").then(function(graph) {
  //if (error) throw error;
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", 2); //changed link width to 2

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
        //.attr("r", radius)
      .attr("class", "node_circles")
      .attr("r", function(d) {return d.size/nodesize_scaler; })
      .attr("fill", 'red') //changed color to red
      .attr("id", function(d) {return d.name; })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

 
  var text = svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", function(d) { return Math.round(d.size/(3*nodesize_scaler))+'px'; })
    //.attr("font-size", function(d) { return Math.round(radius/(3*nodesize_scaler))+'px'; })
    //.text(function(d) { return d.name.substring(0, d.size / 3*nodesize_scaler); })
    //.attr("dx", 12)
    //.attr("dy", ".35em")
    .text(function(d) { return d.name });
  
  node.append("title")
    .text(function(d) { return d.name; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
    
    text.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
    
  }
});



//LINE CHART//
d3.tsv("./data/timeline_data.tsv").then(function(data) {
    // everything below here refers to gapminder.csv
    // because the variable "data" binds to this dataset

    //1. MAKE SVG CANVAS
    // const width = window.innerWidth;
    // const height = window.innerHeight; //gets these numbers in real time from browser window
    
    //take width according to chart div
    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;

    //create svg container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //2.FILTER THE DATA #starting with just one tag, convert string object to datetime

    var parseTime = d3.timeParse("%Y-%m");

    data.forEach( function(d) {

        
        d.time_posted = parseTime(d.time_posted);

    });


    let filtered_data = data.filter(function(d) { //initialize with cottagecore tag

        return d.tags === 'cottagecore';

    });

    drawline(filtered_data, 'cottagecore');

    // A function that updates the chart
    function update(selectedGroup) {

      // Create new data with the selection
      let filtered_data = data.filter(function(d){
        return d.tags === selectedGroup
      })

      drawline(filtered_data, selectedGroup);
    }

    //When a node is clicked, run the updateChart function
    d3.selectAll(".node_circles").on("click", function(d) {
        // recover the option that has been chosen
        var selectedOption = this.id;
        // run the updateChart function with this selected option
        update(selectedOption);
    })

    

    //console.log(filtered_data);

    function drawline(filtered_data, value) {
        //CLEAR CANVAS
        svg.selectAll("*").remove(); 
        //3. DETERMINE MIN AND MAX VALUES OF VARIABLES
        const count = {
            min: d3.min(filtered_data, function(d) {return +d.count;}),
            max: d3.max(filtered_data, function(d) {return +d.count;})
        };

        const time_posted = {
            min: d3.min(filtered_data, function(d) {return d.time_posted;}),
            max: d3.max(filtered_data, function(d) {return d.time_posted;})
        };

        //access with lifeExp.min

        //4. CREATE SCALES
        const margin = {top: 50, left:150, right:50, bottom:100};
        
        //https://observablehq.com/@d3/d3-scaletime

        const xScale = d3.scaleTime()
            .domain([time_posted.min, time_posted.max])
            .range([margin.left, width-margin.right])
        
        const yScale = d3.scaleLinear()
            .domain([0, count.max])
            .range([height-margin.bottom, margin.top]);

        //5. DRAW AXES 
        const xAxis = svg.append("g")
            .attr("class","axis")
            .attr("transform", `translate(0,${height-margin.bottom})`)
            .call(d3.axisBottom().scale(xScale));

        const yAxis = svg.append("g")
            .attr("class","axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft().scale(yScale));

        //6. DRAW DOTS
        //source: https://www.educative.io/answers/how-to-create-a-line-chart-using-d3
        const points = svg.selectAll("dot") // something here is weird and it makes the dots shifted to the right
            .data(filtered_data)
            .enter()
            .append("circle")
                .attr("cx", function (d) { return xScale(d.time_posted); } )
                .attr("cy", function (d) { return yScale(d.count); } )
                .attr("r", 2)
                .style("fill", "steelblue");
        
        //6.5 DRAW LINE
        var line = d3.line()
            .x(function(d) { return xScale(d.time_posted); }) 
            .y(function(d) { return yScale(d.count); }) 
            .curve(d3.curveMonotoneX)
            
            svg.append("path")
            .datum(filtered_data) 
            .attr("class", "line") 
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "#CC0000")
            .style("stroke-width", "2");

        //7. DRAW LABELS
        const xAxisLabel = svg.append("text")
            .attr("class","axisLabel")
            .attr("x", width/2)
            .attr("y", height-margin.bottom/2)
            .text("Date");

        const yAxisLabel = svg.append("text")
            .attr("class","axisLabel")
            .attr("transform","rotate(-90)")
            .attr("x", -height/2)
            .attr("y", margin.left/3)
            .text("Fraction of Tradwife Posts Containing #".concat(value));
}

});


//still to add
//wrap node lables
//multiple line graph function
//zoom
//add introductory page/slides
//add links to tumblr website from tag
//make pretty
