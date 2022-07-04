import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const preHandlers = async (fastify: FastifyInstance, opts = {}) => {
  fastify.decorate('preHandlers', {
    checkLoginCookie: async (request: FastifyRequest, reply: FastifyReply) => {
      const [err] = await fastify.to(request.jwtVerify());
      if (err) throw fastify.httpErrors.unauthorized('You are logged out');
    },

    checkTemporaryCookie: async (request: FastifyRequest, reply: FastifyReply) => {
      const [err] = await fastify.to(request.jwtVerify());
      if (err) throw fastify.httpErrors.unauthorized(`Sorry... There was an error confirming your email`);
    },

    checkCookieOnLogout: async (request: FastifyRequest, reply: FastifyReply) => {
      const [err] = await fastify.to(request.jwtVerify());
      if (err) throw fastify.httpErrors.unauthorized(`You are already logged out`);
    },

    checkPermission: async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.user.role.type !== 'admin') throw fastify.httpErrors.unauthorized('Permission denied');
    },

    checkUserActivation: async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await fastify.mongodb.getUserById(request.user.id);
      if (!user.isActive) throw fastify.httpErrors.unauthorized(`Your email is not confirmed yet`);
    },

    checkVersion: async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await fastify.mongodb.getUserById(request.user.id);
      if (request.user.__v < user.__v) throw fastify.httpErrors.unauthorized(`Please logout and login again`);
    },
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    preHandlers: {
      checkTemporaryCookie: (request: FastifyRequest, reply: FastifyReply) => void;
      checkCookieOnLogout: (request: FastifyRequest, reply: FastifyReply) => void;
      checkLoginCookie: (request: FastifyRequest, reply: FastifyReply) => void;
      checkPermission: (request: FastifyRequest, reply: FastifyReply) => void;
      checkUserActivation: (request: FastifyRequest, reply: FastifyReply) => void;
      checkVersion: (request: FastifyRequest, reply: FastifyReply) => void;
    };
  }
}

export default fp(preHandlers);
