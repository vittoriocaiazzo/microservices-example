import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents } from '@vitto88/lib';
import { Schemas, LoginBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const login = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    // getting the request body
    const { body: requestUser } = request;

    // getting the user from the db
    const user = await fastify.mongodb.getUserByEmail(requestUser.email);

    // checking if the password is correct
    await fastify.tools.checkPassword(requestUser.password, user.password);

    // creating the cookie
    const token = await fastify.tools.createLoginToken(user, reply);
    await fastify.tools.createLoginCookie(token, reply);

    // publishing events
    fastify.events.publishEmailEvent(EmailEvents.USER_LOGIN, { user });

    //replying
    reply.code(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: user.isActive ? 'You are now logged in' : 'You are now logged in. Please confirm your email',
    };
  };

  fastify.route<{ Body: LoginBody }>({
    method: 'POST',
    url: '/login',
    schema: {
      body: fastify.getSchema(Schemas.LOGIN_SCHEMA),
      response: Generic2xxSchema,
    },
    handler: login,
  });
};
