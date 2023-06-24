const mongoose = require('mongoose');

const mongodb = process.env.MONGODB_URL;

mongoose.connect(mongodb, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Connected to MongoDB!');
});

const Trips = require('./trips');

module.exports = {
	Trips,
};
