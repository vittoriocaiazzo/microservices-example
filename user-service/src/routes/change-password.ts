import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, ChangePasswordBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const changePassword = async (request: FastifyRequest<{ Body: ChangePasswordBody }>, reply: FastifyReply) => {
    const { body: requestUser } = request;

    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // checking if the old password is correct
    await fastify.tools.checkPassword(requestUser.oldPassword, user.password);

    // hashing the password and updating the user
    user.password = await fastify.tools.hashPassword(requestUser.newPassword);
    user.__v++;

    // updating the document in the db
    await fastify.mongodb.updateUser(user);

    // //setting the cookie with very short expiration
    // fastify.tools.createLogoutCookie(reply);

    // publishing the events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(user);
    fastify.events.publishUserEvent(UserEvents.USER_UPDATED, authenticationDocument);
    fastify.events.publishEmailEvent(EmailEvents.USER_CHANGE_PASSWORD, { user });

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Password changed',
    };
  };

  fastify.route<{ Body: ChangePasswordBody }>({
    method: 'PATCH',
    url: '/change-password',
    schema: {
      body: fastify.getSchema(Schemas.CHANGE_PASSWORD_SCHEMA),
      response: Generic2xxSchema,
    },
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkUserActivation], {
      relation: 'and',
    }),
    handler: changePassword,
  });
};
