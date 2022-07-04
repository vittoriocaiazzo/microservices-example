import fp from 'fastify-plugin';
import { EXCHANGE_NAME, EmailEventObject, AuthenticationDocument } from '@vitto88/lib';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    events: {
      publishUserEvent: (event: string, user: AuthenticationDocument) => void;
      publishEmailEvent: (event: string, emailEventObject: EmailEventObject) => void;
    };
  }
}

const events: FastifyPluginAsync = async (fastify, opts) => {
  const channel = fastify.amqp.channel;
  channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

  fastify.decorate('events', {
    publishUserEvent: (event: string, user: AuthenticationDocument) => {
      const eventObject = JSON.stringify(user);
      channel.publish(EXCHANGE_NAME, event, Buffer.from(eventObject));
    },
    publishEmailEvent: (event: string, emailEventObject: EmailEventObject) => {
      const eventObject = JSON.stringify(emailEventObject);
      channel.publish(EXCHANGE_NAME, event, Buffer.from(eventObject));
    },
  });
};

export default fp(events);
