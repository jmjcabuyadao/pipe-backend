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
    (request, response) => {
        const params = request.params;
        const results = findRelations( params.name, params.page, params.countPerPage ); // async function, must await
        
        console.log(results); // called before findRelations
    }
);

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