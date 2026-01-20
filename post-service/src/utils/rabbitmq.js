const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error);
        throw error;
    }
}

async function publishEvent(routingKey, message) {
    if (!channel) {
        await connectRabbitMQ()
    }
    try {
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        logger.info(`Event published successfully:${routingKey}`);
    } catch (error) {
        logger.error('Error publishing event', error);
        throw error;
    }
}

module.exports = {
    connectRabbitMQ,
    publishEvent
};