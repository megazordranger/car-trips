const axios = require('axios');
const { Trips } = require('../models/index');

const toRad = (grados) => {
	return (grados * Math.PI) / 180;
};

const getDistance = (coords1, coords2) => {
	const r = 6371; // Radio de la Tierra en km

	// Convertir latitudes y longitudes de grados a radianes
	const lat1Rad = toRad(coords1.lat);
	const lon1Rad = toRad(coords1.lon);
	const lat2Rad = toRad(coords2.lat);
	const lon2Rad = toRad(coords2.lon);

	// Calcular la diferencia de latitud y longitud
	const dLat = lat2Rad - lat1Rad;
	const dLon = lon2Rad - lon1Rad;

	// Aplicar la fórmula de Haversine
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.asin(Math.sqrt(a));
	const d = r * c;

	return d;
};

const getAddress = async (coords) => {
	try {
		const { data } = await axios.get(
			`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}`
		);

		return data.display_name;
	} catch (e) {
		return null;
	}
};

const sendError = (res, customMessage = null) => {
	const error = {
		error: {
			statusCode: 422,
			errorCode: 422,
			srcMessage: customMessage || 'Invalid attribute',
			translatedMessage: customMessage || 'Atributo inválido',
		},
	};

	return res.status(422).send(error);
};

const checkValidations = (readings) => {
	if (
		!readings ||
		!Array.isArray(readings) ||
		readings.length < 5 ||
		readings.some((reading) => !('time' in reading))
	) {
		return false;
	}

	return true;
};

const getBoundingbox = (points) => {
	let xmin = null;
	let ymin = null;
	let xmax = null;
	let ymax = null;

	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		const { lat } = point;
		const { lon } = point;

		if (xmin == null || lon < xmin) xmin = lon;
		if (xmax == null || lon > xmax) xmax = lon;

		if (ymin == null || lat < ymin) ymin = lat;
		if (ymax == null || lat > ymax) ymax = lat;
	}

	const upperLeftCorner = { lat: ymax, lon: xmin };
	const upperRightCorner = { lat: ymax, lon: xmax };
	const lowerLeftCorner = { lat: ymin, lon: xmin };
	const lowerRightCorner = { lat: ymin, lon: xmax };

	const bboxPoints = [
		upperLeftCorner,
		upperRightCorner,
		lowerLeftCorner,
		lowerRightCorner,
	];

	return bboxPoints;
};

const store = async (req, res) => {
	const { readings } = req.body;

	const isInvalid = !checkValidations(readings);
	if (isInvalid) return sendError(res);

	let start = readings[0];
	let end = readings[readings.length - 1];
	let overspeedsCount = 0;
	let isOverspeed = false;
	const points = [];

	readings.forEach((reading) => {
		points.push(reading.location);

		if (reading.speed >= reading.speedLimit) {
			if (!isOverspeed) overspeedsCount++;

			isOverspeed = true;
		} else {
			isOverspeed = false;
		}
	});

	const boundingBox = getBoundingbox(points);

	start = { ...start.location, time: start.time };
	end = { ...end.location, time: end.time };

	const distance = getDistance(start, end);

	const [addressStart, addressEnd] = await Promise.all([
		getAddress(start),
		getAddress(end),
	]);

	start.address = addressStart;
	end.address = addressEnd;

	const data = {
		start,
		end,
		duration: end.time - start.time,
		overspeedsCount,
		distance,
		boundingBox,
	};

	try {
		const trip = new Trips(data);
		await trip.save();
		return res.status(200).send(trip);
	} catch (error) {
		return sendError(res, error.message);
	}
};

const show = async (req, res) => {
	const { offset, limit, start_gte, start_lte, distance_gte } = req.query;

	const skip = offset || 0;
	const items = limit || 20;

	const filters = {};

	if (start_gte) filters['start.time'] = { $gte: start_gte };
	if (start_lte) filters['start.time'] = { $lte: start_lte };
	if (distance_gte) filters.distance = { $gte: distance_gte };

	try {
		const trips = await Trips.find(filters).skip(skip).limit(items);
		return res.json({ trips });
	} catch (error) {
		return sendError(res, error.message);
	}
};

module.exports = { store, show };
