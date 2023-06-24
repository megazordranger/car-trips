// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const express = require('express');
const routes = require('./routes/index');

const port = process.env.PORT || 4000;
const app = express();

app.use(express.json());

app.use('/', routes);

app.listen(port, () => {
	console.log(`API server listening on http://localhost:${port}`);
});

module.exports = app;
