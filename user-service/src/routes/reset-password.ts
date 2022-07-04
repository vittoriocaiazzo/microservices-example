import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, ResetPasswordBody, Generic2xxSchema } from '../plugins/schemas';

interface UrlParams {
  token: string;
}

export default async (fastify: FastifyInstance, opts = {}) => {
  const resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordBody; Params: UrlParams }>,
    reply: FastifyReply
  ) => {
    const { body: requestUser } = request;

    // checking if the user exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // hashing the password
    const password = await fastify.tools.hashPassword(requestUser.password);

    // updating the user password and the version
    user.password = password;
    user.__v++;

    // updating the document with the new password and the new version
    await fastify.mongodb.updateUser(user);

    // publishing the events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(user);
    fastify.events.publishUserEvent(UserEvents.USER_UPDATED, authenticationDocument);
    fastify.events.publishEmailEvent(EmailEvents.USER_PASSWORD_RESET, { user });

    // replying
    reply.code(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Password resetted',
    };
  };

  fastify.route<{ Body: ResetPasswordBody; Params: UrlParams }>({
    method: 'PATCH',
    url: '/reset-password/:token',
    schema: {
      body: fastify.getSchema(Schemas.RESET_PASSWORD_SCHEMA),
      response: Generic2xxSchema,
    },
    preHandler: fastify.auth([fastify.preHandlers.checkTemporaryCookie]),
    handler: resetPassword,
  });
};
