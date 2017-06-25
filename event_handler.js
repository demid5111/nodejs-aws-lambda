var AWS = require('aws-sdk');
var uuid = require('uuid');
var dynamodb = require('serverless-dynamodb-client');
const readFile = require('fs-readfile-promise');

class EventHandler {
    constructor() {
        this.db = dynamodb.doc;

    }

    getConfig() {
        return readFile('requirements/config.json')
            .then(res => JSON.parse(res));
    }

    hello(event) {
        return {
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }
    }

    createTable(name) {
        console.log('In create table');
        var params = {
            TableName: name,
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'name',
                    KeyType: 'RANGE'
                }
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'name',
                    AttributeType: 'S'
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        return dynamodb.raw.createTable(params)
            .promise()
            .then((err, data) => {
                if(err) {
                    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
                } else {
                    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
                }
                console.log('Finished create table');
            });
    }

    deleteTable(name) {
        console.log('In Delete');
        const params = {
            TableName: name
        };

        return dynamodb.raw.deleteTable(params)
            .promise()
            .then((err, data) => {
                if(err) {
                    console.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2));
                } else {
                    console.log('Deleted table. Table description JSON:', JSON.stringify(data, null, 2));
                }
                console.log('Finished Delete');
            });
    }

    putElement(schema, name){
        let id = uuid.v4();
        const params = {
            TableName: schema.properties.config.table.name,
            Item:{
                'id': id,
                'name': name
            }
        };

        return this.db.put(params)
            .promise()
            .then((data) => {
                return data;
            })
    }

    getAll(tacoName, tacoDescription) {
        return this.createTable('event2')
            .then(()=>this.getConfig())
            .then((schema) => {
                return this.putElement(schema, 'Fake_1')
                    .then(()=> this.putElement(schema, 'Fake_2'))
                    .then(()=> schema);
            })
            .then((schema) => {
                console.log('In get all');

                const params = {
                    TableName: schema.properties.config.table.name,
                    ProjectionExpression: '#id, #name',
                    ExpressionAttributeNames: {
                        '#id': 'id',
                        '#name': 'name'
                    }
                };

                return this.db.scan(params)
                    .promise()
                    .then((data) => {
                        return data;
                    });
            });
    }
}

module.exports = EventHandler;
