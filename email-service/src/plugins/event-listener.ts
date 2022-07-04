import fp from 'fastify-plugin';
import { EXCHANGE_NAME, EmailEvents, EmailEventObject, Queues } from '@vitto88/lib';

declare module 'fastify' {
  interface FastifyInstance {
    events: {
      listen: () => void;
    };
  }
}

export default fp(async (fastify, opts) => {
  // configuring rabbitmq
  const channel = fastify.amqp.channel;
  channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  const q = await channel.assertQueue(Queues.EMAIL_SERVICE_QUEUE, { durable: true });
  Object.values(EmailEvents).forEach((event) => {
    channel.bindQueue(q.queue, EXCHANGE_NAME, event);
  });

  fastify.decorate('events', {
    listen: async () => {
      // listening to the channel
      channel.consume(
        q.queue,
        async (msg) => {
          if (!msg) throw new Error();
          const eventObject = JSON.parse(msg.content.toString()) as EmailEventObject;

          // checking if there is the corresponding event function
          if (!fastify.eventFunctions[msg.fields.routingKey]) return channel.nack(msg);

          // transforming the user id in an mongo ObjectId
          eventObject.user._id = new fastify.mongo.ObjectId(eventObject.user._id);

          // calling the event functions
          const [err] = await fastify.to(fastify.eventFunctions[msg.fields.routingKey](eventObject));
          if (err) return channel.nack(msg);

          // creating the email document
          const email = fastify.mongodb.createEmailDocument(eventObject, msg.fields.routingKey);

          // inserting the email record in the db
          const [insertErr] = await fastify.to(fastify.mongodb.insertEmail(email));
          if (insertErr) channel.nack(msg);

          // acknowling the message
          channel.ack(msg);
        },
        { noAck: false }
      );
    },
  });
});
