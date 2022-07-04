import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

interface UrlParams {
  id: string;
}

export default async (fastify: FastifyInstance, opts = {}) => {
  async function getUser(request: FastifyRequest<{ Params: UrlParams }>, reply: FastifyReply) {
    const user = await fastify.mongodb.getUserById(request.params.id);

    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      user,
    };
  }

  fastify.route<{ Params: UrlParams }>({
    method: 'GET',
    url: '/:id/user-profile',
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkPermission], {
      relation: 'and',
    }),
    handler: getUser,
  });
};
