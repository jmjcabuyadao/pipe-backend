const Express = require('express');
const bodyParser = require('body-parser');

const config = require('../config/config.json').server;

const host = process.env.SERVER_HOST || config.host;
const port = process.env.SERVER_PORT || config.port;
const { findRelations, saveRelations } = require('./service');

const app = Express();
app.use(bodyParser.json());

// Endpoint #2: Returns all relations for one organisation
app.get('/organisation/:name/:page?/:countPerPage?', 
    async (request, response) => {
        const params = request.params;
        const results = false;

        let page = params.page;
        if (isNaN(page) || page <= 0) page = 1;
        let perPage = params.countPerPage;
        if (isNaN(perPage) || perPage <= 0 || perPage > 100) perPage = 100;

        try {
            results = await findRelations( params.name, parseInt(page), parseInt(perPage) )
        } catch (error) {
            response.status(500).send(JSON.stringify(error)).end();
        }

        if (typeof results == 'object' && results.length >= 1) {
            response.status(200).send(JSON.stringify(results, null, 1)).end();
        } else if (typeof results == 'object' && results.length == 0) {
            response.status(200).send(`No page #${page} found for ${params.name}\n`).end();
        } else {
            response.status(500).send(results).end();
        }
    }
);

/** Endpoint #1: Add organisation relations in one request **/
app.post('/', 
    async (request, response) => {
        const post = request.body;
        try {
            await saveRelations( post ).then( apiResponse => { 
                response.status(apiResponse.statusCode).send(apiResponse.statusMessage).end();
            });
        } catch (error) {
            response.status(error.errno).send(error.message).end();
        }
    }
);

app.listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}/`);
});