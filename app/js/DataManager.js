"use strict"
const 	d3 = require('d3'),
		fs = require('fs');

//The data object containing all information for the map in memory.
//Documents attached to the map are represented by string URLs.
var liveData = {
	//The feature currently being edited in the map editor.
	//Wrapped in an array so that code processing geo.features can be resued.
	currentFeature: {
		type: 'Feature',
		geometry: {
			type: 'LineString',
			coordinates: []
		}
	},
	//A wrapper for the geoJSON object. Worldly-specific metadata must be stored outside of geo.
	geo: {
		type: "FeatureCollection",
		features: []
	}			
};

module.exports = {

	/**
	Adds a vertex to the geoJSON object.
		x (int)		The x-position of the vertex.
		y (int)		The y-position of the vertex.
	*/
	addPoint: function(x, y){
		liveData.currentFeature.geometry.coordinates.push([x, y]);
	},

	/**
	Adds noise to a Feature object.
		feature (Obj)	A geoJSON feature object
		gridX	(int)	The maximum size of the x values to be generated for noise
		gridY	(int)	The maximum size of the y values to be generated for noise
	*/
	addNoise: function(feature, gridX, gridY){
		for(let i=0; i<feature.geometry.coordinates.length-1;i++){
			let point0 = feature.geometry.coordinates[i];
			let point1 = feature.geometry.coordinates[i+1];

			//Generate a random point to insert between point0 and point1
			//Find a way to determine the centroid of the polygon.
			//Determine the eligibility of a random point based on the difference in signing between the centroid and random point's determinant of vectors.

		}
	},

	/**
	Uses the determinant of vectors of points a & b to determine where point c is in relation to the line between them.
	Returns a string indicating whether the point is to the left, right, or on the line.
		a (Array)	An ordered pair of x and y, connected by line segment to b (ex: [1,2])
		b (Array)	An ordered pair of x and y, connected by line segment to a (ex: [2, 3])
		c (Array)	An ordered pair of x and y, that is either on or on either side of line segment AB
	*/
	determine: function(a, b, c){
		//Points are converted into objects with keys for ease of reading.
		let p0, p1, p2;
		p0 = {x: a[0], y: a[1]};
		p1 = {x: b[0], y: b[1]};
		p2 = {x: c[0], y: c[1]};

		let position = (p1.x-p0.x)(p2.y-p0.y)-(p2.x-p0.x)(p1.y-p0.y);

		return position > 0 ? 'left' : position < 0 ? 'right' : 'on';
	},

	/**
	Returns the index of the feature currently being edited in the feature collection
	*/
	getCurrent: function(){
		return liveData.currentFeature;
	},

	/*
	Returns the map's data object to the frontend.
	*/
	getData: function(){
		return liveData;
	},

	/**
	Converts a linestring(i.e. unfinished polygon) into a closed polygon.
		lineString (Object) A geoJSON Feature object of type LineString.
	*/
	lineToPoly: function(lineString){
		liveData.currentFeature.geometry.type = 'Polygon';
		//D3 ignores the final coordinate of a coordinate array. Thus, a blank is thrown at the end to prevent drawing inaccuracies.
		liveData.currentFeature.geometry.coordinates.push([]);
		liveData.currentFeature.geometry.coordinates = [liveData.currentFeature.geometry.coordinates];
		//Adds "finished" polygon to array.
		liveData.geo.features.push(liveData.currentFeature);
	},

	/**
	Loads a file containing JSON in worldly's map data format, using the location of the package.json as the root
		path (String)	The directory path of the data file, relative to index.html
		callback (Function)	Usually a call to MapEditor's refresh method; a function to be run after the data is loaded.
	*/
	loadFromFile: function(path, callback){
		fs.readFile(path, 'utf8', function(err, data){
			if(err){
				console.log(err);
				return;
			}
			//data is the string returned by fs's readFile function.
			liveData = JSON.parse(data);
			callback();
		})
	},

	/**
	Makes a new LineString object to be the active feature in the editor
	*/
	newLineString: function(){
		liveData.currentFeature = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: []
			}
		}
	},
	/**
	Returns a blank polygon object for a new map. 
	*/
	newMap: function(){
		liveData = {
			//The feature currently being edited in the map editor.
			//Wrapped in an array so that code processing geo.features can be resued.
			currentFeature: {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: []
				}
			},
			//A wrapper for the geoJSON object. Worldly-specific metadata must be stored outside of geo.
			geo: {
				type: "FeatureCollection",
				features: []
			}			
		};
	},

	/**
	Saves map to a text document
	*/
	save: function(){
		var dataString = JSON.stringify(liveData);
		fs.writeFile('app/json/saveData.txt', dataString);
	}

};

function randomInt(min, max){
	return Math.floor(Math.random() * (max-min) + min);
}