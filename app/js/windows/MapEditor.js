const 	d3 = require('d3'),
	 	Map = require('./js/DataManager.js');
const {remote} = require('electron');
const {Menu, MenuItem} = remote;

var state = {
	mode: 'ADD_VERTEX_EXISTING',
	bgColor: '#0077BE',
    landColor: '#2C9800',
    lineColor: '#172500',
    filePath: 'app/json/saveData.txt',
    mapWidth: 1500,
    mapHeight: 900
};

firstDraw();

let map = new Map();

var newMapButton = d3.select('#newMap');
var closePolyButton = d3.select('#closePoly');
var saveButton = d3.select('#save');
var loadButton = d3.select('#load');
var noiseButton = d3.select("#noise");
var zonebutton = d3.select("#subsection")

newMapButton.on('click', newMap);
closePolyButton.on('click', closePoly);
saveButton.on('click', saveMap);
loadButton.on('click', loadMap);
noiseButton.on('click', noise);
zonebutton.on('click', toggleMode)

// //Sets up Save & Load menu options
// let menu = Menu.getApplicationMenu();
// let dataMenu = new MenuItem({
//     label: "File",
//     submenu: [
//         {
//             label: "Save",
//             click: saveMap
//         },
//         {
//             label: "Load",
//             click: loadMap
//         },
//         {
//             label: "Exit",
//             role: "quit"
//         }
//     ]
// });
// //menu.insert(0, dataMenu)
// Menu.setApplicationMenu(menu);


/**
Processes clicks on the SVG based on the state's mode variable
*/
function processClick(){
	switch(state.mode){
		case 'ADD_VERTEX_EXISTING':
			addVertex(d3.mouse(this));
			refresh();
			break;
        case 'SUBSECTION':
            splitOff(d3.mouse(this));
            refresh();
		default: return;
	}
}

function firstDraw(){
    //Clears draw space
    d3.select("svg").remove();

    let svg = d3.select("#chart")
        .append('svg')
            .attr('width', state.mapWidth)
            .attr('height', state.mapHeight)
            .style('background', state.bgColor)
            .on('click', processClick)
            .on('contextmenu', closeCurrent);
}

/**
Updates the SVG by fetching the DataManager copy of the object.
*/
function refresh(){
    //Clears draw space
    d3.selectAll("path").remove();

   //Creates an SVG for my map to live in
    let svg = d3.select("svg");

    //Draw completed polygons
    svg.selectAll('#complete')
        .data(map.getData().geo.features)
        .enter()
        .append('path')
            .attr('d', d3.geoPath())
            .attr('id', (d) => {
                return d.id;
            })
            .attr("class", "complete")
            .attr('fill-rule', 'evenodd')
            .style('fill', state.landColor)
            .style('fill-opacity', 0.5)
            .style('stroke-width', 2)
            .style('stroke', state.lineColor)
            .style('stroke-linejoin', 'round')
            .on('mouseover', function(){
                if(true){
                    d3.select(this)
                        .style('fill-opacity', 1);
                }
            })
            .on('mouseout', function(){
                d3.select(this)
                    .style('fill-opacity', 0.5);
            })
            .on('click', function(){
                switch(state.mode){
                    case 'ADD_VERTEX_EXISTING':
                        setCurrent(d3.select(this).attr("id"));
                        break;
                    case 'SUBSECTION':
                        console.log("Subsection behavior not defined.")
                    default: return;
                }
            })
            .lower();

    //Draw the current polygon
    svg.selectAll('#incomplete')
        .data([map.getCurrent()])
        .enter()
        .append('path')
            .attr('id', (d) => {
                return d.id
            })
            .attr("class", "incomplete")
            .attr('d', d3.geoPath())
            .style('fill', state.landColor)
            .style('fill-opacity', 1)
            .style('stroke-width', 2)
            .style('stroke', state.lineColor)
            .style('stroke-linejoin', 'round')
            .lower();

    return svg;
}

function refreshAllCircles(){
    d3.selectAll("circle").remove();
    let svg = d3.select("svg");

    svg.selectAll('circle')
                .data(prepForEdit(map.getCurrent().geometry.coordinates[0]))
                .enter()
                .append('circle')
                    .attr('r', 5)
                    .attr('cx', function(d){
                            return d[0];
                        })
                    .attr('cy', function(d){
                            return d[1];
                        })
                    .attr('id', function(d, i){
                        return i;
                    })
                    .attr('fill', state.lineColor)
                    .call(d3.drag().on("start", started));
}

function closeCurrent(){
    map.closeCurrent();
    refresh();
}

function drawCircle(svg, x, y, id){
    svg.append('circle')
        .attr('r', 5)
        .attr('cx', x)
        .attr('cy', y)
        .attr('id', id)
        .attr('fill', state.lineColor)
        .call(d3.drag().on("start", started));
}

/**
Handles New Map Creation & refreshes the SVG
*/
function newMap(){
    map.newMap();
    firstDraw();
}

/**
Adds noise to all completed polygons.
*/
function noise(){
    map.addNoiseAll();
    refresh();
    refreshAllCircles();
}

/**
Handles closing of the in-progress polygon and alters the state to prevent drawing vertices
*/
function closePoly(){
    map.lineToPoly();
    newLineString();
    refresh();
    refreshAllCircles();
}

/**
Adds a new LineString(to be turned into a polygon) to the map's Feature collection
*/
function newLineString(){
    map.newLineString();
    refreshAllCircles();
    refresh();
}

/**
Calls the saving function in DataManager
*/
function saveMap(){
    map.save();
}

/**
Called when an element is clicked, this will be called in the context of the clicked element.
*/
function setCurrent(id){
    map.setCurrent(id);
    refresh();
    refreshAllCircles();
}

/**
Handles drag events on circle elements
*/
function started() {
  var circle = d3.select(this).classed("dragging", true);
  var currentShape = map.getCurrent().geometry.coordinates[0];
  currentShape.pop();

  d3.event.on("drag", dragged).on("end", ended);

  function dragged(d) {
    newX = d3.event.x;
    newY = d3.event.y;
    circle.attr("cx", newX).attr("cy", newY);
    currentShape[circle.attr("id")][0] = newX;
    currentShape[circle.attr("id")][1] = newY;

    refresh();
  }

  function ended() {
    circle.classed("dragging", false);
    refresh();
  }

  currentShape.push(currentShape[currentShape.length-1]);
}

/**
Calls the loading function in DataManager
*/
function loadMap(){
    map.loadFromFile(state.filePath, refresh.bind(this));
}

function toggleMode(){
    if(state.mode == "ADD_VERTEX_EXISTING"){
        state.mode = "SUBSECTION"
    }
    else{
        state.mode = "ADD_VERTEX_EXISTING"
    }
}

function splitOff(coord){
    console.log(coord);
}

/**
Interprets data for the DataManager call to add a vertex to the map object.
	coord (Array)	2-member array containing an x and y value.
*/
function addVertex(coord){
	let id = map.addPoint(coord[0], coord[1]);
    let svg = refresh();
    drawCircle(svg, coord[0], coord[1], id);
}

function prepForEdit(arr){
    return arr.slice(0, arr.length-1);
}