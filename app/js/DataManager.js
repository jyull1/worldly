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
			liveData.geo.features[liveData.currentFeature].geometry.coordinates.push([[x, y]]);
		}
		else{
			liveData.geo.features[liveData.currentFeature].geometry.coordinates.push([x, y]);
		}
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
		liveData.geo.features[liveData.currentFeature].geometry.type = 'Polygon';
		//D3 ignores the final coordinate of a coordinate array. Thus, a blank is thrown at the end to prevent drawing inaccuracies.
		liveData.geo.features[liveData.currentFeature].geometry.coordinates.push([]);
		liveData.geo.features[liveData.currentFeature].geometry.coordinates = [liveData.geo.features[liveData.currentFeature].geometry.coordinates];
	},

	/**
	Adds a new LineString object to the geoJSON object's feature array
	*/
	newLineString: function(){
		var lineString = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: []
			}
		}
		liveData.geo.features.push(lineString);
		liveData.currentFeature = liveData.geo.features.indexOf(lineString);
	},
	/**
	Returns a blank polygon object for a new map. 
	*/
	newMap: function(){
		liveData = {
			//Index of the current feature being edited
			currentFeature: 0,
			//A wrapper for the geoJSON object. Worldly-specific metadata must be stored outside of geo.
			geo: {
				type: "FeatureCollection",
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: []
						}
					}
				]
			}			
		}
	}

}