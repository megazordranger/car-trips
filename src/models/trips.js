const mongoose = require('mongoose');

const tripsSchema = new mongoose.Schema({
	start: {
		lat: {
			type: Number,
			required: true,
		},
		lon: {
			type: Number,
			required: true,
		},
		time: {
			type: Number,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
	},
	end: {
		lat: {
			type: Number,
			required: true,
		},
		lon: {
			type: Number,
			required: true,
		},
		time: {
			type: Number,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
	},
	duration: {
		type: Number,
		required: true,
	},
	overspeedsCount: {
		type: Number,
		required: true,
	},
	distance: {
		type: Number,
		required: true,
	},
	boundingBox: { type: [{ lat: Number, lon: Number }], required: true },
});

const tripsModel = mongoose.model('Trip', tripsSchema);

module.exports = tripsModel;
