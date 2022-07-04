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
      if (!request.user.isActive) throw fastify.httpErrors.unauthorized(`Your email is not confirmed yet`);
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
    };
  }
}

export default fp(preHandlers);
