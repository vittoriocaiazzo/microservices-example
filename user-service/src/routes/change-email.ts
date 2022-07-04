import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, ChangeEmailBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const changeEmail = async (request: FastifyRequest<{ Body: ChangeEmailBody }>, reply: FastifyReply) => {
    const { body: requestUser } = request;

    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // updating the user object
    user.email = requestUser.email;
    user.isActive = false;
    user.__v++;

    // updating the document in the db
    await fastify.mongodb.updateUser(user);

    // creating the jwt token
    const token = await fastify.tools.createTemporaryToken(user, reply);

    // publishing the events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(user);
    fastify.events.publishUserEvent(UserEvents.USER_UPDATED, authenticationDocument);
    fastify.events.publishEmailEvent(EmailEvents.USER_EMAIL_CONFIRMATION, { user, token });

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Email sent',
    };
  };

  fastify.route<{ Body: ChangeEmailBody }>({
    method: 'PATCH',
    url: '/change-email',
    schema: {
      body: fastify.getSchema(Schemas.CHANGE_EMAIL_SCHEMA),
      response: Generic2xxSchema,
    },
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkUserActivation], {
      relation: 'and',
    }),
    handler: changeEmail,
  });
};
