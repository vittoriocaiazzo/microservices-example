import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents } from '@vitto88/lib';
import { Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const sendEmailConfirmation = async (request: FastifyRequest, reply: FastifyReply) => {
    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // creating the jwt token
    const token = await fastify.tools.createTemporaryToken(user, reply);

    // sending the email confirmation
    if (user.__v === 0) fastify.events.publishEmailEvent(EmailEvents.USER_SIGNUP_CONFIRMATION, { user, token });
    else fastify.events.publishEmailEvent(EmailEvents.USER_EMAIL_CONFIRMATION, { user, token });

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Email sent',
    };
  };

  fastify.route({
    method: 'GET',
    url: '/send-email-confirmation',
    schema: {
      response: Generic2xxSchema,
    },
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie]),
    handler: sendEmailConfirmation,
  });
};
