import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, ChangeEmailBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const searchUserByEmail = async (request: FastifyRequest<{ Body: ChangeEmailBody }>, reply: FastifyReply) => {
    const { body: requestUser } = request;

    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserByEmail(requestUser.email);

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'User found',
      user,
    };
  };

  fastify.route<{ Body: ChangeEmailBody }>({
    method: 'POST',
    url: '/search-user-by-email',
    schema: {
      body: fastify.getSchema(Schemas.CHANGE_EMAIL_SCHEMA),
    },
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkPermission], {
      relation: 'and',
    }),
    handler: searchUserByEmail,
  });
};
