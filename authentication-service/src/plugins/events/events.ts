import fp from 'fastify-plugin';
import { EXCHANGE_NAME, AuthenticationDocument, EmailEventObject, Queues, UserEvents } from '@vitto88/lib';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    events: {
      publishEmailEvent: (event: string, emailEventObject: EmailEventObject) => void;
      listen: () => void;
    };
  }
}

const events: FastifyPluginAsync = async (fastify, opts) => {
  const channel = fastify.amqp.channel;
  channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  const q = await channel.assertQueue(Queues.AUTHENTICATION_SERVICE_QUEUE, { durable: true });
  channel.bindQueue(q.queue, EXCHANGE_NAME, UserEvents.USER_CREATED);
  channel.bindQueue(q.queue, EXCHANGE_NAME, UserEvents.USER_UPDATED);

  fastify.decorate('events', {
    publishEmailEvent: (event: string, emailEventObject: EmailEventObject) => {
      const eventObject = JSON.stringify(emailEventObject);
      channel.publish(EXCHANGE_NAME, event, Buffer.from(eventObject));
    },

    listen: async () => {
      channel.consume(
        q.queue,
        async (msg) => {
          if (!msg) throw new Error();

          // getting the authentication document
          const authenticationDocument = JSON.parse(msg.content.toString()) as AuthenticationDocument;

          switch (msg.fields.routingKey) {
            case UserEvents.USER_CREATED: {
              const [err] = await fastify.to(fastify.mongodb.insertUser(authenticationDocument));
              if (err) channel.nack(msg);
              break;
            }

            case UserEvents.USER_UPDATED: {
              const [err] = await fastify.to(fastify.mongodb.updateUser(authenticationDocument));
              if (err) channel.nack(msg);
              break;
            }
          }

          // acknowling the message
          channel.ack(msg);
        },
        { noAck: false }
      );
    },
  });
};

export default fp(events);
