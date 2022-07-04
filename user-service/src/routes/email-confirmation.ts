import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Generic2xxSchema } from '../plugins/schemas';

interface UrlParams {
  token: string;
}

export default async (fastify: FastifyInstance, opts = {}) => {
  const emailConfirmation = async (request: FastifyRequest<{ Params: UrlParams }>, reply: FastifyReply) => {
    // searching for the user
    const user = await fastify.mongodb.getUserById(request.user.id);

    // checking if the user is already active
    if (user.isActive) throw fastify.httpErrors.unauthorized('Your email is already confirmed');

    // updating the user
    user.isActive = true;
    user.__v++;
    await fastify.mongodb.updateUser(user);

    // publishing events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(user);
    fastify.events.publishUserEvent(UserEvents.USER_UPDATED, authenticationDocument);
    if (user.__v === 1) fastify.events.publishEmailEvent(EmailEvents.USER_WELCOME, { user });
    else fastify.events.publishEmailEvent(EmailEvents.USER_CHANGE_EMAIL_CONFIRMATION, { user });

    reply.code(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'User activated successfully',
    };
  };

  fastify.route<{ Params: UrlParams }>({
    method: 'GET',
    schema: { response: Generic2xxSchema },
    url: '/email-confirmation/:token',
    preHandler: fastify.auth([fastify.preHandlers.checkTemporaryCookie]),
    handler: emailConfirmation,
  });
};
