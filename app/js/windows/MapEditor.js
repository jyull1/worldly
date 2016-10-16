const 	d3 = require('d3'),
	 	DataManager = require('./js/DataManager.js');

var state = {
	mode: 'ADD_VERTEX_EXISTING',
	bgColor: '#abcdef'
};

var svg = d3.select("#chart")
			.append('svg')
				.attr('width', 900)
				.attr('height', 900)
				.style('background', '#abcdef')
				.on('click', processClick);

var newMapButton = d3.select('#newMap');

newMapButton.on('click', DataManager.newMap);

/**
Processes clicks on the SVG based on the state's mode variable
*/
function processClick(){
	switch(state.mode){
		case 'ADD_VERTEX_EXISTING':
			addVertex(d3.mouse(this));
			refresh();
			break;
		default: return;
	}
}

/**
Updates the SVG by fetching the DataManager copy of the object.
*/
function refresh(){
    //Clears draw space
    d3.select("svg").remove();

   //Creates an SVG for my map to live in
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 900)
        .attr("height", 900)
        .style('background', state.bgColor)
        .on('click', processClick);

    console.log(DataManager.getData())

    switch(state.mode){
    	case 'ADD_VERTEX_EXISTING':
    		svg.selectAll('circle')
    			.data(DataManager.getData().geo.coordinates[0])
    			.enter()
    			.append('circle')
    				.attr('r', 5)
    				.attr('cx', function(d){
    						return d[0];
    					})
    				.attr('cy', function(d){
    						return d[1];
    					})
    				.attr('fill', '#000000');
    				break;
    	default: return;
    }
}

/********

/**
Interprets data for the DataManager call to add a vertex to the map object.
	coord (Array)	2-member array containing an x and y value.
	newPolygon (boolean)	Optional boolean indicating whether the vertex will be added as a new polygon.
*/
function addVertex(coord, newPolygon){
	if(newPolygon){
		DataManager.addPoint(coord[0], coord[1], newPolygon);
	}
	else{
		DataManager.addPoint(coord[0], coord[1]);
	}
}