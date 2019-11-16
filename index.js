require('dotenv-flow').config();

const express = require('express');

const routeBuilder = require('lib/route_builder');
const routes = require('lib/routes');

const app = express();
const port = process.env.PORT;

app.use(routeBuilder(routes));
// app.get('/', (req, res) => res.send('hello world'));
const server = app.listen(port, () => console.log(`Running on port ${port}`));
process.on('exit', () =>  server.close());
