
//NETWORK//

//https://gist.github.com/DavidDeSimone/1a32a97913360c8e181e
//https://gist.github.com/mbostock/4062045
//https://stackoverflow.com/questions/41928319/text-not-showing-as-label-in-d3-force-layout for naming nodes

// function dragstarted(event, d) {
//     if (!event.active) simulation.alphaTarget(0.3).restart();
//     d.fx = d.x;
//     d.fy = d.y;
//   }
  
//   function dragged(event, d) {
//     d.fx = event.x;
//     d.fy = event.y;
//   }
  
//   function dragended(event, d) {
//     if (!event.active) simulation.alphaTarget(0);
//     d.fx = null;
//     d.fy = null;
//   }

// const width = document.querySelector("#network").clientWidth;
// const height = document.querySelector("#network").clientHeight;

const width = 1600;
const height = 1600;

const nodesize_scaler = .050;
//const radius = 10;


//console.log(width);
//console.log(height);

//create svg container
const svg = d3.select("#network")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// making graph static https://jarrettmeyer.com/2019/01/04/static-force-layout-d3js

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.name; }))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
        return d.size/nodesize_scaler+3;
      }));
    //.force('collision', d3.forceCollide().radius(radius));


d3.json("./data/graph.json").then(function(graph) {
  //if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", 0); //changed link width to 2

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
        //.attr("r", radius)
      .attr("class", "node_circles")
      .attr("r", function(d) {return d.size/nodesize_scaler; })
      //.attr("fill", '#113834') //changed color 
      .attr("id", function(d) {return d.name; });
      // .call(d3.drag()
      //     .on("start", dragstarted)
      //     .on("drag", dragged)
      //     .on("end", dragended));
  

  var text = svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("text-anchor", "middle")
    .attr('textLength', function(d) {return Math.round(2*(d.size/nodesize_scaler)*.80);})
    .attr('lengthAdjust', 'spacingAndGlyphs')
    //.attr("font-size", function(d) { return Math.round(d.size/(2*nodesize_scaler))+'px'; })
    .text(function(d) { return d.name });
  
  node.append("title")
    .text(function(d) { return d.name; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  while (simulation.alpha() > simulation.alphaMin()) {
      simulation.tick();
  } //causes layout to happen without animation

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x = Math.max(d.size/nodesize_scaler, Math.min(width - d.size/nodesize_scaler, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(d.size/nodesize_scaler, Math.min(height - d.size/nodesize_scaler, d.y)); });
    
    text.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
    
  }

  // //fisheye
  // var fisheye = d3.fisheye.circular()
  //     .radius(200)
  //     .distortion(2);

  // svg.on("mousemove", function(event, d) {
  //   fisheye.focus(d3.pointer(event));
  
  //   node.each(function(d) { d.fisheye = fisheye(d); })
  //       .attr("cx", function(d) { return d.fisheye.x; })
  //       .attr("cy", function(d) { return d.fisheye.y; })
  //       .attr("r", function(d) { return d.fisheye.z * d.size/nodesize_scaler; });
  
  //   link.attr("x1", function(d) { return d.source.fisheye.x; })
  //       .attr("y1", function(d) { return d.source.fisheye.y; })
  //       .attr("x2", function(d) { return d.target.fisheye.x; })
  //       .attr("y2", function(d) { return d.target.fisheye.y; });
    
  //   text.attr("x", function(d) { return d.fisheye.x;})
  //       .attr("y", function(d) {return d.fisheye.y;})
  //       .attr("textLength", function(d) {return Math.round((d.size/nodesize_scaler)*2*.80)*d.fisheye.z;});
  // });

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

    //INITIALIZE CHART WITH COTTAGECORE
    let filtered_data = data.filter(function(d) { //initialize with cottagecore tag

        return d.tags === 'cottagecore';


    });

    drawline(filtered_data, ['cottagecore']);

    //change transparency of node
    d3.selectAll("#cottagecore").attr('fill-opacity', 0.2);

    //UPDATE CHART

    // A function that updates the chart
    function update(selectedGroup) {

      // Create new data with the selection
      let filtered_data = data.filter(function(d){
        return selectedGroup.includes(d.tags);
      })


      drawline(filtered_data, selectedGroup);
    }

    var selectedOptions = ["cottagecore"];

    //When a node is clicked, run the updateChart function
    d3.selectAll(".node_circles").on("click", function(d) {
        if (selectedOptions.includes(this.id)) {
            selectedOptions = selectedOptions.filter(e => e !== this.id);
            //change opacity of circle back
            d3.select(this).transition()
                .duration(500)
                .attr('fill-opacity', 1);

        } else {
            // recover the option that has been chosen and add to array
            selectedOptions.push(this.id); 
            //change opacity of circle
            d3.select(this).transition()
                .duration(500)
                .attr('fill-opacity', 0.2);
        }
        // run the updateChart function with this selected option
        update(selectedOptions);
    })

    

    //console.log(filtered_data);

    function drawline(filtered_data, selectedTags) {
        //grouped line chart example https://d3-graph-gallery.com/graph/line_several_group.html
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

        //GROUP DATA BY TAGS
        filtered_data = Array.from(d3.group(filtered_data, d => d.tags));


        //4. CREATE SCALES
        const margin = {top: 50, left:75, right:50, bottom:75};
        
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
            .call(d3.axisBottom().scale(xScale))
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)" );

        const yAxis = svg.append("g")
            .attr("class","axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft().scale(yScale));

        //COLOR SCHEME
        const color = d3.scaleOrdinal()
            .domain(selectedTags)
            .range(d3.schemeSet2);

        //CREATE LEGEND
        //https://d3-graph-gallery.com/graph/custom_legend.html
        // Add one dot in the legend for each name.
        svg.selectAll("legenddots")
        .data(selectedTags)
        .enter()
        .append("circle")
        .attr("cx", 200)
        .attr("cy", function(d,i){ return 25 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)})

        // Add one dot in the legend for each name.
        svg.selectAll("legendlabels")
        .data(selectedTags)
        .enter()
        .append("text")
        .attr("x", 220)
        .attr("y", function(d,i){ return 25 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

        //DRAW LINE

        var line = d3.line()

        svg.selectAll(".line")
        .data(filtered_data)
        .join("path")
          .attr("fill", "none")
          .attr("stroke", function(d){ return color(d[0]) })
          .attr("stroke-width", 1.5)
          .attr("d", function(d){
            var line = d3.line()
            .x(function(d) { return xScale(d.time_posted); })
            .y(function(d) { return yScale(parseFloat(d.count)); })
            //curve(d3.MonotoneX)
            (d[1]);
            return line;
          });

        //7. DRAW LABELS
        // const xAxisLabel = svg.append("text")
        //     .attr("class","axisLabel")
        //     .attr("x", width/2)
        //     .attr("y", height-margin.bottom/2)
        //     .text("Date");

        // const yAxisLabel = svg.append("text")
        //     .attr("class","axisLabel")
        //     .attr("transform","rotate(-90)")
        //     .attr("x", -height/2)
        //     .attr("y", margin.left/3)
        //     .text("Fraction of Tradwife Posts Containing Tag");
}

});

//modal
//https://www.w3schools.com/howto/howto_css_modals.asp

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

//automatically show modal
modal.style.display = "block";

//$('#myModal').modal('show');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 

//zoom and pan with axis (for timeline)
//https://d3-graph-gallery.com/graph/interactivity_zoom.html#axisZoom
