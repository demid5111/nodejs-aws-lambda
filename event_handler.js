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

    putElement(tableName, name) {
        let id = uuid.v4();
        const params = {
            TableName: tableName,
            Item: {
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

    prepareDB() {
        return this.getConfig()
            .then((schema) => this.createTable(schema.properties.config.table.name).then(() => schema))
            .then((schema) => this.fillDB(schema.properties.config.table.name).then(() => schema));
    }

    fillDB(tableName) {
        return this.putElement(tableName, 'Fake_1')
            .then(() => this.putElement(tableName, 'Fake_2'));
    }

    getAll() {
        return this.getConfig()
            .then((schema) => this.fillDB(schema.properties.config.table.name)
                .then(() => schema))
            .then((schema) => {
                console.log('In get all');
                const tableName = schema.properties.config.table.name;
                const params = {
                    TableName: tableName,
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
