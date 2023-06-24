/* eslint-disable no-undef */

const request = require('supertest');
const app = require('../src/server');

describe('Post trips', () => {
	it('should return error beacause doesnt have data', async () => {
		const res = await request(app).post('/api/trips/v1').send();
		expect(res.statusCode).toEqual(422);
		expect(res.body).toHaveProperty('error');
	});

	it('should return error beacause is just one reading', async () => {
		const oneReading = {
			readings: [
				{
					time: 1642500462000,
					speed: 9,
					speedLimit: 38,
					location: {
						lat: -33.580158,
						lon: -70.567227,
					},
				},
			],
		};

		const res = await request(app).post('/api/trips/v1').send(oneReading);
		expect(res.statusCode).toEqual(422);
		expect(res.body).toHaveProperty('error');
	});

	it('should return error beacause one reading doesnt have time', async () => {
		const readings = {
			readings: [
				{
					speed: 9,
					speedLimit: 38,
					location: {
						lat: -33.580158,
						lon: -70.567227,
					},
				},
				{
					time: 1642500466000,
					speed: 26,
					speedLimit: 38,
					location: {
						lat: -33.58013,
						lon: -70.566995,
					},
				},
				{
					time: 1642500470000,
					speed: 28,
					speedLimit: 38,
					location: {
						lat: -33.580117,
						lon: -70.566633,
					},
				},
				{
					time: 1642500474000,
					speed: 13,
					speedLimit: 38,
					location: {
						lat: -33.580078,
						lon: -70.566408,
					},
				},
				{
					time: 1642500478000,
					speed: 18,
					speedLimit: 38,
					location: {
						lat: -33.580005,
						lon: -70.566498,
					},
				},
				{
					time: 1642500482000,
					speed: 32,
					speedLimit: 38,
					location: {
						lat: -33.58002,
						lon: -70.566837,
					},
				},
				{
					time: 1642500486000,
					speed: 38,
					speedLimit: 38,
					location: {
						lat: -33.580038,
						lon: -70.567265,
					},
				},
				{
					time: 1642500490000,
					speed: 38,
					speedLimit: 38,
					location: {
						lat: -33.580043,
						lon: -70.56773,
					},
				},
				{
					time: 1642500494000,
					speed: 35,
					speedLimit: 38,
					location: {
						lat: -33.580048,
						lon: -70.56817,
					},
				},
				{
					time: 1642500498000,
					speed: 20,
					speedLimit: 38,
					location: {
						lat: -33.580053,
						lon: -70.568502,
					},
				},
			],
		};

		const res = await request(app).post('/api/trips/v1').send(readings);
		expect(res.statusCode).toEqual(422);
		expect(res.body).toHaveProperty('error');
	});

	it('should get success response', async () => {
		const readings = {
			readings: [
				{
					time: 1642500462000,
					speed: 9,
					speedLimit: 38,
					location: {
						lat: -33.580158,
						lon: -70.567227,
					},
				},
				{
					time: 1642500466000,
					speed: 26,
					speedLimit: 38,
					location: {
						lat: -33.58013,
						lon: -70.566995,
					},
				},
				{
					time: 1642500470000,
					speed: 28,
					speedLimit: 38,
					location: {
						lat: -33.580117,
						lon: -70.566633,
					},
				},
				{
					time: 1642500474000,
					speed: 13,
					speedLimit: 38,
					location: {
						lat: -33.580078,
						lon: -70.566408,
					},
				},
				{
					time: 1642500478000,
					speed: 18,
					speedLimit: 38,
					location: {
						lat: -33.580005,
						lon: -70.566498,
					},
				},
				{
					time: 1642500482000,
					speed: 32,
					speedLimit: 38,
					location: {
						lat: -33.58002,
						lon: -70.566837,
					},
				},
				{
					time: 1642500486000,
					speed: 38,
					speedLimit: 38,
					location: {
						lat: -33.580038,
						lon: -70.567265,
					},
				},
				{
					time: 1642500490000,
					speed: 38,
					speedLimit: 38,
					location: {
						lat: -33.580043,
						lon: -70.56773,
					},
				},
				{
					time: 1642500494000,
					speed: 35,
					speedLimit: 38,
					location: {
						lat: -33.580048,
						lon: -70.56817,
					},
				},
				{
					time: 1642500498000,
					speed: 20,
					speedLimit: 38,
					location: {
						lat: -33.580053,
						lon: -70.568502,
					},
				},
			],
		};

		const res = await request(app).post('/api/trips/v1').send(readings);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('start');
		expect(res.body).toHaveProperty('end');
		expect(res.body).toHaveProperty('duration');
		expect(res.body).toHaveProperty('overspeedsCount');
		expect(res.body).toHaveProperty('distance');
		expect(res.body).toHaveProperty('boundingBox');

		expect(res.body.duration).toBe(36000);
		expect(res.body.overspeedsCount).toBe(1);
		expect(res.body.distance > 0).toBe(true);
		expect(Array.isArray(res.body.boundingBox)).toBe(true);
	});
});

describe('Get trips', () => {
	it('should get trips list', async () => {
		const res = await request(app).get('/api/trips/v1').send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('trips');
		expect(Array.isArray(res.body.trips)).toBe(true);
	});

	it('should get trips list with one or less objects', async () => {
		const res = await request(app).get('/api/trips/v1?limit=1').send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('trips');
		expect(Array.isArray(res.body.trips)).toBe(true);
		expect(res.body.trips.length).toBeLessThanOrEqual(1);
	});

	it('should get trips list with start_gte = 10', async () => {
		const res = await request(app).get('/api/trips/v1?start_gte=10').send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('trips');
		expect(Array.isArray(res.body.trips)).toBe(true);

		const hasValidStartTime = res.body.trips.every((trip) => {
			return trip.start.time >= 10;
		});
		expect(hasValidStartTime).toBe(true);
	});

	it('should get trips list with start_lte = 10', async () => {
		const res = await request(app).get('/api/trips/v1?start_lte=10').send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('trips');
		expect(Array.isArray(res.body.trips)).toBe(true);

		const hasValidStartTime = res.body.trips.every((trip) => {
			return trip.start.time <= 10;
		});
		expect(hasValidStartTime).toBe(true);
	});

	it('should get trips list with distance_gte = 10', async () => {
		const res = await request(app).get('/api/trips/v1?distance_gte=10').send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('trips');
		expect(Array.isArray(res.body.trips)).toBe(true);

		const hasValidDistance = res.body.trips.every((trip) => {
			return trip.sitance >= 10;
		});
		expect(hasValidDistance).toBe(true);
	});
});
