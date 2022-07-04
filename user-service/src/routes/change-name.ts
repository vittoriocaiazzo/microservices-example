import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, ChangeNameBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const changeName = async (request: FastifyRequest<{ Body: ChangeNameBody }>, reply: FastifyReply) => {
    const { body: requestUser } = request;

    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // updating the user object
    user.firstName = requestUser.firstName;
    user.lastName = requestUser.lastName;
    user.__v++;

    // updating the document in the db
    await fastify.mongodb.updateUser(user);

    // publishing the events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(user);
    fastify.events.publishUserEvent(UserEvents.USER_UPDATED, authenticationDocument);
    fastify.events.publishEmailEvent(EmailEvents.USER_CHANGE_NAME, { user });

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Successfully changed your name',
    };
  };

  fastify.route<{ Body: ChangeNameBody }>({
    method: 'PATCH',
    url: '/change-name',
    schema: {
      body: fastify.getSchema(Schemas.CHANGE_NAME_SCHEMA),
      response: Generic2xxSchema,
    },
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkUserActivation], {
      relation: 'and',
    }),
    handler: changeName,
  });
};
