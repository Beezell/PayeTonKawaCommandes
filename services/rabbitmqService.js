const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            orderCreated: 'order.created',
            orderUpdated: 'order.updated',
            orderDeleted: 'order.deleted',
            orderStatusChanged: 'order.status.changed'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            await this.channel.assertQueue(this.queues.orderCreated, { durable: true });
            await this.channel.assertQueue(this.queues.orderUpdated, { durable: true });
            await this.channel.assertQueue(this.queues.orderDeleted, { durable: true });
            await this.channel.assertQueue(this.queues.orderStatusChanged, { durable: true });

            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async publishOrderCreated(orderData) {
        try {
            await this.channel.sendToQueue(
                this.queues.orderCreated,
                Buffer.from(JSON.stringify(orderData)),
                { persistent: true }
            );
            console.log('Published order created event');
        } catch (error) {
            console.error('Error publishing order created event:', error);
            throw error;
        }
    }

    async publishOrderUpdated(orderData) {
        try {
            await this.channel.sendToQueue(
                this.queues.orderUpdated,
                Buffer.from(JSON.stringify(orderData)),
                { persistent: true }
            );
            console.log('Published order updated event');
        } catch (error) {
            console.error('Error publishing order updated event:', error);
            throw error;
        }
    }

    async publishOrderDeleted(orderId) {
        try {
            await this.channel.sendToQueue(
                this.queues.orderDeleted,
                Buffer.from(JSON.stringify({ orderId })),
                { persistent: true }
            );
            console.log('Published order deleted event');
        } catch (error) {
            console.error('Error publishing order deleted event:', error);
            throw error;
        }
    }

    async publishOrderStatusChanged(orderId, newStatus) {
        try {
            await this.channel.sendToQueue(
                this.queues.orderStatusChanged,
                Buffer.from(JSON.stringify({ orderId, newStatus })),
                { persistent: true }
            );
            console.log('Published order status changed event');
        } catch (error) {
            console.error('Error publishing order status changed event:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQService(); 