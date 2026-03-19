const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log("RabbitMQ connected");
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
