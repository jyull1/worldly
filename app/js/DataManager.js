const d3 = require('d3');

//The data object containing all information for the map in memory.
//Documents attached to the map are represented by string URLs.
var liveData = {};

module.exports = {

	/**
	Adds a vertex to the geoJSON object.
		x (int)		The x-position of the vertex.
		y (int)		The y-position of the vertex.
		newPolygon (boolean)	Optional parameter that checks if a new polygon is to be created,
								w/the vertex as it's first point.
	*/
	addPoint: function(x, y, newPolygon){
		//If the vertex belongs to a new polygon within the geoJSON object
		if(newPolygon){
			liveData.geo.coordinates.push([[x, y]]);
		}
		else{
			liveData.geo.coordinates[0].push([x, y]);
		}
	},

	/*
		Returns the map's data object to the frontend.
	*/
	getData: function(){
		return liveData;
	},

	/**
	Returns a blank polygon object for a new map. 
	*/
	newMap: function(){
		liveData = {
			//A wrapper for the geoJSON object. Worldly-specific metadata must be stored outside of geo.
			geo: {
				type: "Polygon",
				coordinates: [
					[]
				]
			}			
		}
	}

}