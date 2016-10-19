"use strict";

const d3 = require('d3');
const topojson = require('topojson');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;

let height = 800,
    width = 1200;

// const projection = d3.geoProjection(function(x, y) { return [x, y];})
//         .precision(0).scale(1).translate([0, 0]);

const path = d3.geoPath();
const state = {
    data: null
};

let toggle = d3.select("#toggleMap")
    .on('click', () => {
        ipc.send('toggle-map');
});

loadData("JSON/simple.json");

ipc.on('load-data', (event, arg) => {
    console.log(arg);
    d3.select("svg").remove();
    loadData(arg);
});

function loadData(fileName){

    //Imports JSON data of England using TopoJSON data format
    fs.readFile(fileName, "utf8", (err, data) => {
        data = JSON.parse(data);
        state.data = data;

        draw();

        // let districts = topojson.feature(data, data.objects.eer);

    });

}

//Adds points to array of point data; currently coordinates extends only the base perimeter of the polygon.
function addPoints(pos, dataObj){
    let coordinates = dataObj.coordinates[0];
    let cap = coordinates[coordinates.length-1];
    coordinates.pop();
    dataObj.coordinates[0].push(pos, cap);
}

function draw(){
    //Clears draw space
    d3.select("svg").remove();

   //Creates an SVG for my map to live in
    let svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        //Assigns event listener to redraw map if point is clicked
        .on("click", update);

    //Draws geometry to the svg
    svg.append("path")
          .data(state.data)
          .attr("d", path);
}

function update(){
    let points = d3.mouse(this);
    addPoints(points, state.data);
    draw();
}