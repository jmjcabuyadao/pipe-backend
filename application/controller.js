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
        const results = await findRelations( params.name, params.page, params.countPerPage )
                                                    .then( rows => { return rows; } );

        if (typeof results == 'object') {
            response.statusCode = 200;
            response.write(JSON.stringify(results, null, 1));
        } else {
            response.statusCode = 500;
            response.write(results);
        }
        response.end();
    }
);

/** Endpoint #1: Add organisation relations in one request **/
app.post('/', 
    (request, response) => {
        const post = request.body;
        saveRelations( post )
            .then( apiResponse => { 
                response.statusMessage = apiResponse.statusMessage;
                response.statusCode = apiResponse.statusCode;
                response.write(apiResponse.statusMessage);
                response.end();
            }).catch( error => {
                response.statusMessage = error.message;
                response.statusCode = error.code;
                response.write(JSON.stringify(error));
                response.end();
            });
    }
);

app.listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}/`);
});