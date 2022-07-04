import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents } from '@vitto88/lib';
import { Schemas, ForgotPasswordBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const forgotPassword = async (request: FastifyRequest<{ Body: ForgotPasswordBody }>, reply: FastifyReply) => {
    // getting the request body
    const { body: requestUser } = request;

    // checking  if the user exists
    const user = await fastify.mongodb.getUserByEmail(requestUser.email);

    // checking if the user is active
    if (!user.isActive) throw fastify.httpErrors.unauthorized('Your email is not confirmed yet');

    // creating the jwt token
    const token = await fastify.tools.createTemporaryToken(user, reply);

    // sending the reset email
    fastify.events.publishEmailEvent(EmailEvents.USER_FORGOT_PASSWORD, { user, token });

    // replying
    reply.code(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Email sent',
    };
  };

  fastify.route<{ Body: ForgotPasswordBody }>({
    method: 'POST',
    url: '/forgot-password',
    schema: {
      body: fastify.getSchema(Schemas.FORGOT_PASSWORD_SCHEMA),
      response: Generic2xxSchema,
    },
    handler: forgotPassword,
  });
};
