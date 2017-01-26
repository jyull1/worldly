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

}