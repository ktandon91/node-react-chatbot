'use strict'

const dialogflow=require('dialogflow');
const config= require('../config/keys');

const projectID = config.googleProjectID;
const credentials = {
    client_email: config.googleClientEmail,
    private_key:config.googlePrivateKey
}

const structjson = require('./structjson');
const sessionClient = new dialogflow.SessionsClient({projectID:projectID, credentials:credentials});

const mongoose = require('mongoose');
const Registration = mongoose.model('registration');

module.exports = {
    textQuery: async function(text, userID, parameters = {}) {
        let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userID);
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: text,
                    // The language used by the client (en-US)
            languageCode: 'en-US',
                    },
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        };
 
  // Send request and log result
        let responses = await sessionClient.detectIntent(request);
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);

        responses = await self.handleAction(responses);    
        return responses;
        },

    eventQuery: async function(event, userID, parameters = {}) {
    let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userID);

    let self = module.exports;

    const request = {
        session: sessionPath,
        queryInput: {
            event: {
                name: event,
                parameters: structjson.jsonToStructProto(parameters),
                languageCode: 'en-US',
                },
        },
        queryParams: {
            payload: {
                data: parameters
            }
        }
    };

// Send request and log result
    let responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);

    responses = await self.handleAction(responses);    
    return responses;
    },


    handleAction: function(responses){
        let self = module.exports;
        let queryResult = responses[0].queryResult;

        switch(queryResult.action) {
            case 'recommendcourses-yes':
                if(queryResult.allRequiredParamsPresent){
                    self.saveRegistration(queryResult.parameters.fields);
                }
                break;
        }

        return responses;
    },

    saveRegistration: async function(fields) {
        const registration = new Registration(
            {
                name: fields.name.stringValue,
                address: fields.address.stringValue,
                phone: fields.phone.stringValue,
                email: fields.email.stringValue,
                dateSent: Date.now()
            }
        );
        try{
            let reg = await registration.save();
            console.log(reg);
        }catch(err){
            console.log(err);
        }



    }
}