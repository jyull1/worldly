class Feature {
	constructor(id){
		this.type = "Feature";
		this.geometry = {
			type: "Polygon",
			coordinates: [[]]
		};

		this.id = id;

	}
}

module.exports = Feature;