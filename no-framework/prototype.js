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

const isParent = orgObject => {
    let orgNameArray = [];
    let daughters = false;

    if (orgObject.hasOwnProperty('org_name')) {
        let orgName = orgObject.org_name;
        if (orgNameArray.includes(orgName) == false) {
            orgNameArray.push(orgName);
        }
        
        if (orgObject.hasOwnProperty('daughters')) {
            daughters = orgObject.daughters;
        }
    }

    return daughters;
}

const main = inputJson => {
    if (isParent(inputJson) !== false) {
        let topLevelDaughters = isParent(inputJson);
        if (topLevelDaughters instanceof Array) {
            //console.log(topLevelDaughters);
            topLevelDaughters.forEach(topLeveldaughter => {
                if (topLeveldaughter.hasOwnProperty('org_name') && topLeveldaughter.hasOwnProperty('daughters')) {
                    let secondLevelDaughters = topLeveldaughter.daughters;
                    if (secondLevelDaughters instanceof Array) {
                        //console.log(secondLevelDaughters);
                        secondLevelDaughters.forEach(secondLevelDaughter => {
                            if (secondLevelDaughter.hasOwnProperty('org_name') && secondLevelDaughter.hasOwnProperty('daughters')) {
                                let thirdLevelDaughters = secondLevelDaughter.daughters;
                                if (thirdLevelDaughters instanceof Array) {
                                    //console.log(thirdLevelDaughters);
                                    thirdLevelDaughters.forEach(thirdLevelDaughter => {
                                        if (thirdLevelDaughter.hasOwnProperty('org_name') && thirdLevelDaughter.hasOwnProperty('daughters')) {
                                            let fourthLevelDaughters = thirdLevelDaughter.daughters;
                                            if (fourthLevelDaughters instanceof Array) {
                                                //console.log(fourthLevelDaughters);
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
        // object is top-level parent
    }
    console.log(Object.keys(inputJson).length);
}