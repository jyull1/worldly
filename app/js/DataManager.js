"use strict"
const 	d3 = require('d3'),
		fs = require('fs'),
		Feature = require('./Feature.js');


class Map {

	constructor(){
		var self = this;
		this.idIterator = 0;
		this.assignId = function(){
			let temp = this.idIterator;
			this.idIterator++;
			return temp;
		}

		this.currentFeature = new Feature(this.assignId());

		this.geo = {};
		this.geo.type = "FeatureCollection";
		this.geo.features = [];
	}

	findFeatureByID(id){
		let featureArray = this.geo.features.filter((feature) => {
			return feature.id == id;
		});

		return featureArray[0];		
	}

	/**
	Adds a vertex to the geoJSON object.
		x (int)		The x-position of the vertex.
		y (int)		The y-position of the vertex.
	*/
	addPoint(x, y){
		let lastPolygon = this.currentFeature.geometry.coordinates.length - 1;
		this.currentFeature.geometry.coordinates[lastPolygon].pop();
		//This must be done twice, to preserve the spare element on the list.
		this.currentFeature.geometry.coordinates[lastPolygon].push([x, y]);
		this.currentFeature.geometry.coordinates[lastPolygon].push([x, y]);

		//Returns an ID for a corresponding circle SVG element to be created.
		return this.currentFeature.geometry.coordinates[lastPolygon].length-2;
	}

	/**
		Adds noise to a Feature object.
			feature (Obj)	A geoJSON feature object
			gridX	(int)	The maximum size of the x values to be generated for noise
			gridY	(int)	The maximum size of the y values to be generated for noise
	*/
	addNoise(feature){

		try{
			feature.geometry.coordinates.map((outline) => {
				//'outline' is one of the perimeters in the polygon "feature", either the perimeter of the whole polygon or one of its holes.
				if(outline.length<4096){
					//Because the list is changing as it is being operated on, the original length is stored in a variable.
					//Removing the placeholder value from the end of the array, as it distorts the noise function
					let cap = outline.pop();
					let iterations = (outline.length-1);
					let point0, point1;

					for(let i=0; i<iterations*2;i+=2){
						point0 = outline[i];
						point1 = outline[i+1];
						//console.log(point0, point1);

						outline.splice(i+1, 0, noisyPoint(point0, point1));
					}

					//Does an additional calculation between the first and last points.
					point0 = outline[outline.length-1];
					point1 = outline[0];
					outline.push(noisyPoint(point0, point1));

					outline.push(cap);
				}
			});
		}

		catch (e){
			//If the shape throws a TypeError, it is likely that a bad polygon is appended at the end of the perimeter array.
			//The fix for this is to simply remove the bad element; if it is another error, then it will be thrown as normal.
			if(e instanceof TypeError){
				feature.geometry.coordinates.pop();
				return this.addNoise(feature);
			}
			else{
				throw e
			}
		}
		
		//console.log(feature.geometry.coordinates[0]);
		return feature;
	}

	/**
	Adds noise to every inactive polygon on the map.
	*/
	addNoiseAll(){
		this.geo.features.map(this.addNoise);
	}

	closeCurrent(){
		this.currentFeature.geometry.coordinates.push([]);
	}

	/**
	Uses the determinant of vectors of points a & b to determine where point c is in relation to the line between them.
	Returns a string indicating whether the point is to the left, right, or on the line.
		a (Array)	An ordered pair of x and y, connected by line segment to b (ex: [1,2])
		b (Array)	An ordered pair of x and y, connected by line segment to a (ex: [2, 3])
		c (Array)	An ordered pair of x and y, that is either on or on either side of line segment AB
	*/
	determine(a, b, c){
		//Points are converted into objects with keys for ease of reading.
		let p0, p1, p2;

		p0 = {x: a[0], y: a[1]};
		p1 = {x: b[0], y: b[1]};
		p2 = {x: c[0], y: c[1]};

		let position = (p1.x-p0.x)*(p2.y-p0.y)-(p2.x-p0.x)*(p1.y-p0.y);

		return position > 0 ? 'left' : position < 0 ? 'right' : 'on';
	}

	/**
	Returns the index of the feature currently being edited in the feature collection
	*/
	getCurrent(){
		return this.currentFeature;
	}

	/*
	Returns the map's data object to the frontend.
	*/
	getData(){
		return this;
	}

	/**
	Converts a linestring(i.e. unfinished polygon) into a closed polygon.
		lineString (Object) A geoJSON Feature object of type LineString.
	*/
	lineToPoly(lineString){

		//If the polygon has been previously created (and thus has a low ID#), it will replace the old instance of itself in the feature array
		if(this.currentFeature.id < this.geo.features.length){
			this.geo.features[this.currentFeature.id] = this.currentFeature;
		}
		else{
			//Else, it adds a new polygon to array.
			this.geo.features.push(this.currentFeature);
		}
		
	}

	/**
	Loads a file containing JSON in worldly's map data format, using the location of the package.json as the root
		path (String)	The directory path of the data file, relative to index.html
		callback (Function)	Usually a call to MapEditor's refresh method; a function to be run after the data is loaded.
	*/
	loadFromFile(path, callback){
		fs.readFile(path, 'utf8', function(err, data){
			if(err){
				console.log(err);
				return;
			}
			//data is the string returned by fs's readFile function.
			let newData = JSON.parse(data);

			this.idIterator = newData.idIterator;
			this.currentFeature = newData.currentFeature;
			this.geo = newData.geo;
			callback();
		}.bind(this))
	}

	/**
	Makes a new LineString object to be the active feature in the editor
	*/
	newLineString(){
		this.currentFeature = new Feature(this.assignId());
	}

	/**
	Returns a blank polygon object for a new map. 
	*/
	newMap(){
		this.idIterator = 1;

		this.currentFeature = new Feature(this.assignId());

		this.geo = {};
		this.geo.type = "FeatureCollection";
		this.geo.features = [];
	}

	/**
	Saves map to a text document
	*/
	save(){
		var dataString = JSON.stringify(this.getData());
		fs.writeFile('app/json/saveData.txt', dataString);
	}

	setCurrent(id){
		d3.event.stopPropagation();
		this.currentFeature = this.findFeatureByID(id);
		// console.log(this.currentFeature);
	}

}

module.exports = Map;


//HELPER FUNCTIONS

function distance(p1, p2){
	return Math.sqrt(Math.pow(p2[0]-p1[0], 2)+Math.pow(p2[1]-p1[1], 2))
}

function midPoint(p1, p2){
	return [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
}

function noisyPoint(p1, p2){
	let newPoint;
	if(Math.random() > 0.5){
		let mid = midPoint(p1, p2);
		let radius = distance(p1, p2)/2;
		newPoint = randWithin(mid, radius);
	}
	else{
		newPoint = [randomInt(Math.min(p1[0], p2[0]), Math.max(p1[0], p2[0])), randomInt(Math.min(p1[1], p2[1]), Math.max(p1[1], p2[1]))];
	}

	return newPoint;
}

function randomInt(min, max){
	return Math.floor(Math.random() * (max-min) + min);
}

function randWithin(point, radius){
	let angle = Math.random()*Math.PI*2;

	radius *= Math.random();

	let x = (Math.cos(angle) * (radius))+point[0];
	let y = (Math.cos(angle) * (radius))+point[1];

	return [x, y];
}

/**
Appends the last element of an array to itself; this is necessary for drawing paths from arrays of coordinates.
    points(Array)   Array of members [x,y], corresponding to Euclidian points
*/
function prepForPath(points){
    let arr = points.slice();
    return arr.push(arr[arr.length - 1]);
}

