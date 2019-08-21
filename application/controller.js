const Express = require('express');
const bodyParser = require('body-parser');

const config = require('../config/config.json').server;

const host = process.env.SERVER_HOST || config.host;
const port = process.env.SERVER_PORT || config.port;
const { findRelations, saveRelations } = require('./service');

const app = Express();
app.use(bodyParser.json());

/** @TODO: Resolve asynchronicity */
app.get('/organisation/:name/:page?/:countPerPage?', 
    async (request, response) => {
        const params = request.params;
        const results = await findRelations( params.name, params.page, params.countPerPage )
                                .then( rows => { return rows; } ); // async function, must await
        
        if (typeof results == 'object' && results.length >= 1) {
            response.status(200)
            response.write(JSON.stringify(results, null, 1));
        } else if (typeof results == 'number' && results === 500) {
            response.status(results)
            response.write(`Something went wrong :(\n`);
        }
        response.end();
    }
);

/** @TODO: Resolve asynchronicity */
app.post('/', 
    async (request, response) => {
        const post = request.body;
        let [ statusMessage, statusCode ] = await saveRelations( post );
         
        response.statusMessage = statusMessage;
        response.statusCode = statusCode;
        response.end();
    }
);

app.listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}/`);
});

const ApiResponse = responseBody => {

};