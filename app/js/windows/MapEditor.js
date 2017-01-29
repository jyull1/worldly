const 	d3 = require('d3'),
	 	DataManager = require('./js/DataManager.js');

var state = {
	mode: 'ADD_VERTEX_EXISTING',
	bgColor: '#bbbbff',
    filePath: 'app/json/saveData.txt'
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
var saveButton = d3.select('#save');
var loadButton = d3.select('#load');

newMapButton.on('click', newMap);
closePolyButton.on('click', closePoly);
saveButton.on('click', saveMap);
loadButton.on('click', loadMap);

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

    //Draw completed polygons
    svg.selectAll('path')
        .data(DataManager.getData().geo.features)
        .enter()
        .append('path')
            .attr('d', path)
            .style('fill', '#000000')
            .style('fill-opacity', 0.0)
            .style('stroke-width', 2)
            .style('stroke', '#000000')
            .style('stroke-linejoin', 'round')
            .on('mouseover', function(){
                if(true){
                    d3.select(this)
                        .style('fill-opacity', 0.5);
                }
            })
            .on('mouseout', function(){
                d3.select(this)
                    .style('fill-opacity', 0.0);
            });

    // //Draw the current polygon
    // svg.selectAll('path')
    //     .data([DataManager.getCurrent()])
    //     .enter()
    //     .append('path')
    //         .attr('d', path)
    //         .style('fill', '#000000')
    //         .style('fill-opacity', 0.0)
    //         .style('stroke-width', 2)
    //         .style('stroke', '#000000')
    //         .style('stroke-linejoin', 'round');
            
    switch(state.mode){
    	case 'ADD_VERTEX_EXISTING':
    		svg.selectAll('circle')
    			.data(DataManager.getCurrent().geometry.coordinates)
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
    DataManager.lineToPoly();
    DataManager.newLineString();
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

/**
Calls the saving function in DataManager
*/
function saveMap(){
    DataManager.save();
}

/**
Calls the loading function in DataManager
*/
function loadMap(){
    DataManager.loadFromFile(state.filePath, refresh.bind(this));
}
/********

/**
Interprets data for the DataManager call to add a vertex to the map object.
	coord (Array)	2-member array containing an x and y value.
*/
function addVertex(coord){
	DataManager.addPoint(coord[0], coord[1]);
}