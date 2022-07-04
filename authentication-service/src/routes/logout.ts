import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    //setting the cookie with very short expiration
    fastify.tools.createLogoutCookie(reply);

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'You are now logged out',
    };
  };

  fastify.route({
    method: 'GET',
    url: '/logout',
    schema: { response: Generic2xxSchema },
    preHandler: fastify.auth([fastify.preHandlers.checkCookieOnLogout]),
    handler: logout,
  });
};
