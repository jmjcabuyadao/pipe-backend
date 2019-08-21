const OrgTreeModel = require('../model/OrgTree');
const { Sequelize, Database } = require('../database/initialize')

const findRelations = (organisation, page = 1, count = 100) => {
    if (page <= 0) page = 1;
    Database.authenticate().then( () => {
        let orgTree = OrgTreeModel(Database, Sequelize.DataTypes);
        orgTree.findAll({
            where: {
                node_two: organisation
            },
            order: [
                ['node_one', 'ASC']
            ],
            offset: (page-1)*count,
            limit: count,
            attributes: [
                ['node_one', 'organisation'],
                ['branch_type', 'relationship']
            ]
        }).then( rows => {
            console.log(JSON.stringify(rows, null, 4));

            return rows;
        });
    }).catch( err => {
        console.error('Unable to connect to the database: ', err);
    });

    /**
     * For pagination, result is an array of arrays with 100 objects each and index is page number
     */
}

const saveRelations = post => {
    let statusCode = 200;
    let statusMessage = '';
    establishRelationships(post).then( relationships => {
        Database.authenticate().then( () => {
            let orgTree = OrgTreeModel(Database, Sequelize.DataTypes);
            orgTree.bulkCreate(relationships, 
                { fields: [ 'nodeOne', 'nodeTwo', 'branchType' ], updateOnDuplicate: [ 'branchType'] } )
                .then( () => {
                    orgTree.findAll().then( rows => {
                        statusMessage = `Total Rows: ${rows.length}`;
                        console.log(statusMessage);
                    }).catch( error => {
                        statusMessage = `Error: ${JSON.stringify(error)}`;
                        statusCode = err.statusCode;

                        console.error(statusMessage);
                    });
            });
        }).catch( err => {
            statusMessage = `Unable to establish connection: ${JSON.stringify(err)}`;
            statusCode = err.statusCode;

            console.error(statusMessage);
        });
    }).catch( error => {
        statusMessage = `Error: ${JSON.stringify(error)}`;
        statusCode = err.statusCode;

        console.error(statusMessage);
    });

    return [ statusMessage, statusCode ];
}

const establishRelationships = async input => {
    let parents = await setParents(input).then( parents => { return parents; } );
    let daughters = await setDaughters(parents).then( daughters => { return daughters; } );
    let sisters = await setSisters(daughters).then( sisters => { return sisters; } );
    
    return [...parents, ...daughters, ...sisters];
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
        
                let newRelations = await setParents(daughter).then( result => { return result; } );
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
 * @param {array} parentsArray 
 */
const setDaughters = parentsArray => {
    let relations = [];

    return new Promise( (resolve, reject) => {
        try {
            for (let i = 0; i < parentsArray.length; i++) {
                let daughter = parentsArray[i].nodeTwo;
                let parent = parentsArray[i].nodeOne;
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
            daughters.forEach( leftSister => {
                daughters.forEach( rightSister => {
                    if (areSisters(leftSister, rightSister) === false) return;
        
                    let sisterRelationship = JSON.stringify(relateNodes(leftSister.nodeOne, rightSister.nodeOne, 'sister'));
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
 * @param {string} leftSister 
 * @param {string} rightSister 
 */
const areSisters = (leftSister, rightSister) => {
    // Refers to the same org
    if ( (leftSister.nodeOne == rightSister.nodeOne) && (leftSister.nodeTwo == rightSister.nodeTwo) ) {
        return false;
    }
    // One org is a parent or child of the other
    if ( leftSister.nodeOne == rightSister.nodeTwo || leftSister.nodeTwo == rightSister.nodeOne ) {
        return false;
    }
    // Not same parent or not same daughter
    if ( leftSister.nodeTwo != rightSister.nodeTwo ) {
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