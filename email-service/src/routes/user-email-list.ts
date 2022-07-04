import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

interface UrlParams {
  id: string;
}

export default async (fastify: FastifyInstance, opts = {}) => {
  async function getUser(request: FastifyRequest<{ Params: UrlParams }>, reply: FastifyReply) {
    const emails = await fastify.mongodb.getUserEmailList(request.params.id);

    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      emails,
    };
  }

  fastify.route<{ Params: UrlParams }>({
    method: 'GET',
    url: '/:id/user-email-list',
    preHandler: fastify.auth([fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkPermission], {
      relation: 'and',
    }),
    handler: getUser,
  });
};
