const amqp = require('amqplib');
const config = require('../../utils/config');

class Producer {
  async sendMessage(queue, message) {
    try {
      const connection = await amqp.connect(config.rabbitMq.server); // ex: amqp://localhost:5672
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(message));
      await channel.close();
      await connection.close();
    } catch (err) {
      console.warn('[Producer] RabbitMQ OFF, message not sent:', err.code || err.message);
    }
  }
}

module.exports = new Producer();
