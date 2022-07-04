import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async (fastify: FastifyInstance, opts = {}) => {
  const myProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    // getting the user from the db and checking if it exists
    const user = await fastify.mongodb.getUserById(request.user.id);

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Successfully got your profile',
      myProfile: user,
    };
  };

  fastify.route({
    method: 'GET',
    url: '/my-profile',
    // schema: { response: MyProfileSchema },
    preHandler: fastify.auth(
      [fastify.preHandlers.checkLoginCookie, fastify.preHandlers.checkUserActivation, fastify.preHandlers.checkVersion],
      {
        relation: 'and',
      }
    ),
    handler: myProfile,
  });
};
