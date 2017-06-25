const EventHander = require('./event_handler');
const _ = require('lodash');

module.exports.getAll = (event, context, callback) => {
    const eventHandler = new EventHander();
    console.log(event.body);
    const params = _.isString(event.body) ? JSON.parse(event.body) : event.body;

    return eventHandler.getAll(params)
        .then((data) => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };

            callback(null, response);
        })
        .catch((err) => {
            const response = {
                statusCode: 409,
                body: {
                    message: `Could not get all elements from table`,
                    stack: err
                }
            };

            callback(null, response);
        });
};