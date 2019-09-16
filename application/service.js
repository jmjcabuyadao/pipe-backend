const OrgTreeModel = require('../model/OrgTree');
const { Sequelize, Database } = require('../model/Database')

const findRelations = (organisation, page = 1, count = 100) => {
    return Database.authenticate().then( () => {
        let orgTree = OrgTreeModel(Database, Sequelize.DataTypes);
        let rows = orgTree.findAll({
            where: {
                node_two: organisation
            },
            order: [
                ['node_one', 'ASC']
            ],
            offset: (page-1)*count,
            limit: count,
            attributes: [
                ['branch_type', 'relationship_type'],
                ['node_one', 'org_name']
            ],
            raw: true
        }).then( result => {

            return result;
        }).catch ( error => {

            throw new Error(error);
        });

        return rows;
    }).catch( err => {
        let message = `Database error: \n\t\t${err}`;
        console.error(err);

        return message;
    });
}

const saveRelations = async post => {
    let apiResponse = {};
    let oldCount = newCount = 0;

    await Database.authenticate().then( async () => {
        let relationships = await establishRelationships(post);
        
        if (relationships.length <= 0) {
            return parseApiResponse();
        }
        
        let orgTree = OrgTreeModel(Database, Sequelize.DataTypes);
        let error = '';

        oldCount = await orgTree.count();
        newCount = await orgTree.bulkCreate( relationships, 
                        { fields: [ 'nodeOne', 'nodeTwo', 'branchType' ], updateOnDuplicate: [ 'branchType'] } )
                        .then( () => { return orgTree.count(); })
                        .catch( (err) => { error = err; return 0; } );

        message = `Total rows inserted: ${newCount - oldCount}\n`;
        if (newCount === 0) {
            message = `An error occurred while inserting to database: ${error}`;
        }
        
        console.log(message);
        apiResponse = parseApiResponse(message, 200);
    }).catch( err => {
        message = `Database error: Unable to establish connection ${JSON.stringify(err)}`;
        console.error(message);

        apiResponse = parseApiResponse(message, err.errno);
    });

    return apiResponse;
}

const parseApiResponse = (message = "Transaction completed!", code = 200) => {
    return {
        statusMessage: message,
        statusCode: code
    }
}

const establishRelationships = async input => {
    try {
        let parents = await setParents(input);
        let daughters = await setDaughters(parents);
        let sisters = await setSisters(daughters);
        
        return [...parents, ...daughters, ...sisters];
    } catch (error) {
        return [];
    }
}

/**
 * Sets parent relationships
 * @param {JSON} inputObject 
 */
const setParents = inputObject => {
    let relations = []
    let parent = '';
    let daughters = [];

    return new Promise( async (resolve, reject) => {
        try {
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
        
                let newRelations = await setParents(daughter);
                relations = [...relations, ...newRelations];
            }

            resolve(relations);
        } catch (ex) {
            reject(ex);
        }
    });
}

/**
 * Sets child relationships by flipping parent relationships
 * @param {array} parents 
 */
const setDaughters = parents => {
    let relations = [];

    return new Promise( (resolve, reject) => {
        try {
            for (let i = 0; i < parents.length; i++) {
                let daughter = parents[i].nodeTwo;
                let parent = parents[i].nodeOne;
                let daughterRelationship = relateNodes(daughter, parent, 'daughter');
        
                relations.push(daughterRelationship);
            }

            resolve(relations);
        } catch (ex) {
            reject(ex);
        }
    });
}

/**
 * Sets sibling relationships
 * @param {array} daughters 
 */
const setSisters = daughters => {
    let relations = [];
    return new Promise( (resolve, reject) => {
        try {
            daughters.forEach( leftDaughter => {
                daughters.forEach( rightDaughter => {
                    if (areSisters(leftDaughter, rightDaughter) === false) return;
        
                    let sisterRelationship = JSON.stringify(relateNodes(leftDaughter.nodeOne, rightDaughter.nodeOne, 'sister'));
                    // Sister relationship not yet in array
                    if (relations.includes(sisterRelationship) === false) {
                        relations.push(sisterRelationship);
                    }
                });
            });

            resolve(sortRelations(relations));
        } catch (ex) {
            reject(ex);
        }
    });
}

/**
 * For semantic labelling of relationships
 * @param {string} firstOrg 
 * @param {string} secondOrg 
 * @param {string} relationshipType 
 */
const relateNodes = (firstOrg, secondOrg, relationshipType) => {
    return {
        nodeOne: firstOrg,
        nodeTwo: secondOrg,
        branchType: relationshipType,
    }
}

/**
 * Check if two organisations are sisters (i.e. same level on the tree)
 * @param {string} leftDaughter 
 * @param {string} rightDaughter 
 */
const areSisters = (leftDaughter, rightDaughter) => {
    // Refers to the same org
    if ( (leftDaughter.nodeOne == rightDaughter.nodeOne) && (leftDaughter.nodeTwo == rightDaughter.nodeTwo) ) {
        return false;
    }
    // One org is a parent or child of the other
    if ( leftDaughter.nodeOne == rightDaughter.nodeTwo || leftDaughter.nodeTwo == rightDaughter.nodeOne ) {
        return false;
    }
    // Not same parent or not same daughter
    if ( leftDaughter.nodeTwo != rightDaughter.nodeTwo ) {
        return false;
    }

    return true;
}

const sortRelations = relations => {
    return relations.sort().map( object => {
        return JSON.parse(object);
    });
}

module.exports = {
    findRelations,
    saveRelations
}