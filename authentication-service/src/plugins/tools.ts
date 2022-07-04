import { AuthenticationDocument } from '@vitto88/lib';
import { FastifyPluginAsync, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    tools: {
      hashPassword: (plainPassword: string) => Promise<string>;
      checkPassword: (requestPassword: string, userPassword: string) => Promise<void>;
      createTemporaryToken: (user: AuthenticationDocument, reply: FastifyReply) => Promise<string>;
      createLoginToken: (user: AuthenticationDocument, reply: FastifyReply) => Promise<string>;
      createTemporaryCookie: (token: string, reply: FastifyReply) => Promise<void>;
      createLoginCookie: (token: string, reply: FastifyReply) => Promise<void>;
      createLogoutCookie: (reply: FastifyReply) => void;
    };
  }
}

const tools: FastifyPluginAsync = async (fastify, opts) => {
  async function hashPassword(plainPassword: string) {
    const [hashError, hashedPassword] = await fastify.to<string>(fastify.bcrypt.hash(plainPassword));
    if (hashError) throw fastify.httpErrors.internalServerError('Error hashing the password');
    return hashedPassword;
  }

  async function checkPassword(requestPassword: string, userPassword: string) {
    const [hashErr, passwordMatch] = await fastify.to(fastify.bcrypt.compare(requestPassword, userPassword));
    if (hashErr) throw fastify.httpErrors.internalServerError('Error checking credentials');
    if (!passwordMatch) throw fastify.httpErrors.unauthorized('Incorrect email or password');
  }

  async function createTemporaryToken(user: AuthenticationDocument, reply: FastifyReply) {
    const [signError, token] = await fastify.to(
      reply.jwtSign(
        { id: user._id.toString(), isActive: user.isActive, role: user.role, __v: user.__v },
        { expiresIn: process.env.TEMPORARY_TOKEN_EXPIRATION }
      )
    );
    if (signError) throw new Error('Error signign the token');
    return token;
  }

  async function createTemporaryCookie(token: string, reply: FastifyReply) {
    if (!process.env.TEMPORARY_COOKIE_MAX_AGE) throw fastify.httpErrors.internalServerError('Cookie maxAge not found');
    reply.setCookie('auth', token, {
      path: '/',
      httpOnly: true,
      maxAge: +process.env.TEMPORARY_COOKIE_MAX_AGE,
    });
  }

  async function createLoginToken(user: AuthenticationDocument, reply: FastifyReply) {
    const [signError, token] = await fastify.to(
      reply.jwtSign(
        { id: user._id.toString(), isActive: user.isActive, role: user.role, __v: user.__v },
        { expiresIn: process.env.LOGIN_TOKEN_EXPIRATION }
      )
    );
    if (signError) throw fastify.httpErrors.internalServerError('Error signign the token');
    return token;
  }

  async function createLoginCookie(token: string, reply: FastifyReply) {
    if (!process.env.LOGIN_COOKIE_MAX_AGE) throw fastify.httpErrors.internalServerError('Cookie maxAge not found');
    reply.setCookie('auth', token, {
      path: '/',
      httpOnly: true,
      maxAge: +process.env.LOGIN_COOKIE_MAX_AGE,
    });
  }

  async function createLogoutCookie(reply: FastifyReply) {
    reply.setCookie('auth', 'logout', {
      path: '/',
      maxAge: 1,
      httpOnly: true,
    });
  }

  fastify.decorate('tools', {
    hashPassword,
    checkPassword,
    createTemporaryToken,
    createTemporaryCookie,
    createLoginToken,
    createLoginCookie,
    createLogoutCookie,
  });
};

export default fp(tools);
