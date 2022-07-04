import { UserDocument } from '@vitto88/lib';
import { FastifyPluginAsync, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    tools: {
      hashPassword: (plainPassword: string) => Promise<string>;
      checkPassword: (requestPassword: string, userPassword: string) => Promise<void>;
      createTemporaryToken: (user: UserDocument, reply: FastifyReply) => Promise<string>;
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

  async function createTemporaryToken(user: UserDocument, reply: FastifyReply) {
    const [signError, token] = await fastify.to(
      reply.jwtSign(
        { id: user._id.toString(), isActive: user.isActive, role: user.role, __v: user.__v },
        { expiresIn: process.env.TEMPORARY_TOKEN_EXPIRATION }
      )
    );
    if (signError) throw new Error('Error signign the token');
    return token;
  }

  fastify.decorate('tools', {
    hashPassword,
    checkPassword,
    createTemporaryToken,
  });
};

export default fp(tools);
