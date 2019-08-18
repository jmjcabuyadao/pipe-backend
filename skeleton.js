'use strict';

const fs = require('fs');
let inputString = "";
let inputJson = {};

fs.readFile('./input.json', (error, buffer) => {
    try {
        inputString = buffer.toString();
        inputJson = JSON.parse(inputString);

        main(inputJson);
    } catch (e) {
        console.error(e);
    }
});

const main = input => {
    let parents = setDaughters(input);
    let daughters = setParents(parents);
    let sisters = setSisters(daughters);

    let relationships = [...parents, ...daughters, ...sisters];
    console.log(relationships);
}

const setDaughters = (inputObject, relations = []) => {
    let parent = '';
    let daughters = [];

    if (inputObject.hasOwnProperty('org_name')) {
        parent = inputObject.org_name;
        
        if (inputObject.hasOwnProperty('daughters')) {
            daughters = inputObject.daughters;
        }
    }
    
    for (let i = 0; i < daughters.length; i++) {
        let daughter = daughters[i];
        let parentRelationship = setRelationship(parent, daughter.org_name, 'parent');
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
        let daughterRelationship = setRelationship(daughter, parent, 'daughter');
        relations.push(daughterRelationship);
    }

    return relations;
}

const setSisters = parentsArray => {
    let relations = [];
    parentsArray.forEach( leftSister => {
        parentsArray.forEach( rightSister => {
            if ( (leftSister.org == rightSister.org) && (leftSister.of == rightSister.of) ) {
                return;
            }

            if ( leftSister.org == rightSister.of || leftSister.of == rightSister.org ) {
                return;
            }

            if ( leftSister.of != rightSister.of ) {
                return;
            }

            let sisterRelationship = JSON.stringify(setRelationship(leftSister.org, rightSister.org, 'sister'));
            
            if (relations.includes(sisterRelationship) == false) {
                relations.push(sisterRelationship);
            }
        });
    });
    
    return sortRelations(relations);
}

const setRelationship = (firstOrg, secondOrg, relationshipType) => {
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