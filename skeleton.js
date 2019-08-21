'use strict';

const http = require('http');
const mysql = require('mysql');

let inputString = "";
let inputJson = {};

http.createServer( async (request, response) => {
    const { headers, method, url } = request;
    let body = [];
    let results = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        try {
            body = Buffer.concat(body).toString();
            let inputJson = JSON.parse(body);
      
            if (inputJson.hasOwnProperty('daughters') === false) {
                console.log(`No organisation relationships found!`);
      
                return;
            }
    
            insertRelations(inputJson);
            retrieveRelations('Black banana').then( (results) => {
                response.statusCode = 200;
                response.statusMessage = 'Success';
                response.setHeader('Content-Type', 'application/json');
                response.write(JSON.stringify(results, "", "  "));
                response.end();
            });
        } catch (e) {
            console.error(e);
        }
    });

}).listen(8000, 'localhost');

const insertRelations = async (input) => {
    let parents = setDaughters(input);
    let daughters = setParents(parents);
    let sisters = setSisters(daughters);

    let relationships = [...parents, ...daughters, ...sisters];
    
    let dbConnection = await createDatabaseConnection().then( connection => {
        connectToDatabase(connection);

        return connection;
    });

    relationships.forEach( async branch => {
        let insertQuery =  `INSERT INTO org_tree (node_one, node_two, branch_type) VALUES ('${branch.org}', '${branch.of}', '${branch.is_a}');`;
        return new Promise(async (resolve, reject) => {
            dbConnection.query(
                insertQuery,
                (error, results) => {
                    if (error !== null && error.errno !== 1062) {
                        console.error(JSON.stringify(error));
                        throw err;
                    } else if (error !== null && error.errno === 1062) {
                        
                        return;
                    }

                    return resolve(this);
                }
            );
        }).catch(error => {
            console.error(error);
        });
    });
}

const retrieveRelations = async (targetNode) => {
    let dbConnection = await createDatabaseConnection().then( connection => {
        connectToDatabase(connection);

        return connection;
    });

    let selectQuery = `SELECT * FROM org_tree WHERE node_two = LOWER('${targetNode}') ORDER BY node_one ASC;`;
    //let selectQuery = `SELECT * FROM org_tree ORDER BY id ASC;`;
    return new Promise( (resolve, reject) => {
        dbConnection.query(
            selectQuery,
            (err, results) => {
                if (err) {
                    console.error(JSON.stringify(err));

                    throw err;
                }

                resolve(parseResults(results));
            }
        );
    }).catch(error => {
        console.error(error);
        dbConnection.destroy();

        reject(error)
    });
}

const setDaughters = (inputObject, relations = []) => {
    let parent = '';
    let daughters = [];

    if (inputObject.hasOwnProperty('org_name')) {
        parent = inputObject.org_name;
    }
            
    if (inputObject.hasOwnProperty('daughters')) {
        daughters = inputObject.daughters;
    }

    for (let i = 0; i < daughters.length; i++) {
        let daughter = daughters[i];
        let parentRelationship = relateNodes(parent, daughter.org_name, 'parent');
        
        relations.push(parentRelationship);

        let newRelations = setDaughters(daughter);
        relations = [...relations, ...newRelations];
    }

    return relations;
}

const setParents = parentsArray => {
    let relations = [];

    for (let i = 0; i < parentsArray.length; i++) {
        let daughter = parentsArray[i].of;
        let parent = parentsArray[i].org;
        let daughterRelationship = relateNodes(daughter, parent, 'daughter');

        relations.push(daughterRelationship);
    }

    return relations;
}

const setSisters = parentsArray => {
    let relations = [];
    parentsArray.forEach( leftSister => {
        parentsArray.forEach( rightSister => {
            if (areSisters(leftSister, rightSister) === false) return;

            let sisterRelationship = JSON.stringify(relateNodes(leftSister.org, rightSister.org, 'sister'));
            
            if (relations.includes(sisterRelationship) === false) {
                relations.push(sisterRelationship);
            }
        });
    });
    
    return sortRelations(relations);
}

const areSisters = (leftSister, rightSister) => {
    if ( (leftSister.org == rightSister.org) && (leftSister.of == rightSister.of) ) {
        return false;
    }

    if ( leftSister.org == rightSister.of || leftSister.of == rightSister.org ) {
        return false;
    }

    if ( leftSister.of != rightSister.of ) {
        return false;
    }

    return true;
}

const relateNodes = (firstOrg, secondOrg, relationshipType) => {
    return {
        org: firstOrg,
        is_a: relationshipType,
        of: secondOrg
    }
}

const sortRelations = relations => {
    return relations.sort().map( object => {
        return JSON.parse(object);
    });
}

const parseResults = results => {
    let resultsArray = [];
    results.forEach( (rel) => {
        let resultRelation = {
            organisation: rel.node_one,
            relationship: rel.branch_type
        }
        resultsArray.push(resultRelation);
    });

    return resultsArray;
}

const connectToDatabase = connection => {
    return new Promise(async (resolve, reject) => {
        await connection.query("SELECT NOW()",
            (err, results) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    throw err;
                }

                return resolve(this);
            }
        );
    });
}

const createDatabaseConnection = async () => {
    let connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Password1',
        database: 'pipedrive'
    });

    await connection.connect();
    return connection;
}