const 	d3 = require('d3'),
	 	DataManager = require('./js/DataManager.js');

var state = {
	mode: 'ADD_VERTEX_EXISTING',
	bgColor: '#bbbbff'
};

const path = d3.geoPath();

var svg = d3.select("#chart")
			.append('svg')
				.attr('width', 900)
				.attr('height', 900)
				.style('background', state.bgColor)
				.on('click', processClick);

var newMapButton = d3.select('#newMap');
var closePolyButton = d3.select('#closePoly');
var newLineButton = d3.select('#newPoly');

newMapButton.on('click', newMap);
closePolyButton.on('click', closePoly);
newLineButton.on('click', newLineString)

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

    svg.selectAll('path')
        .data(DataManager.getData().geo.features)
        .enter()
        .append('path')
            .attr('d', path)
            .style('fill', '#000000')
            .style('fill-opacity', 0.0)
            .style('stroke-width', 2)
            .style('stroke', '#000000')
            .style('stroke-linejoin', 'round');

    switch(state.mode){
    	case 'ADD_VERTEX_EXISTING':
    		svg.selectAll('circle')
    			.data(DataManager.getData().geo.features[DataManager.getCurrent()].geometry.coordinates)
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

/**
Handles New Map Creation & refreshes the SVG
*/
function newMap(){
    DataManager.newMap();
    state.mode = 'ADD_VERTEX_EXISTING';
    refresh();
}

/**
Handles closing of the in-progress polygon and alters the state to prevent drawing vertices
*/
function closePoly(){
    state.mode = 'DEFAULT_RESTING';
    DataManager.lineToPoly();
    refresh();
}

/**
Adds a new LineString(to be turned into a polygon) to the map's Feature collection
*/
function newLineString(){
    state.mode = 'ADD_VERTEX_EXISTING';
    DataManager.newLineString();
    refresh();
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