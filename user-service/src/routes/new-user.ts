import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailEvents, UserEvents } from '@vitto88/lib';
import { Schemas, SignupBody, Generic2xxSchema } from '../plugins/schemas';

export default async (fastify: FastifyInstance, opts = {}) => {
  const signup = async (request: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
    // getting the request body
    const { body: requestUser } = request;

    // creating the user document
    const userDocument = fastify.mongodb.createUserDocument(requestUser);

    // Checking existing user
    await fastify.mongodb.checkExistingUser(userDocument);

    // hashing the password
    userDocument.password = await fastify.tools.hashPassword(userDocument.password);

    // inserting the user in the db
    await fastify.mongodb.insertUser(userDocument);

    // creating the cookie
    const token = await reply.jwtSign(
      {
        id: userDocument._id.toString(),
        isActive: userDocument.isActive,
        role: userDocument.role,
        __v: userDocument.__v,
      },
      { expiresIn: process.env.TEMPORARY_TOKEN_EXPIRATION }
    );

    // publishing the user-created and email-confirmation events
    const authenticationDocument = fastify.mongodb.createAuthenticationDocument(userDocument);
    fastify.events.publishUserEvent(UserEvents.USER_CREATED, authenticationDocument);
    fastify.events.publishEmailEvent(EmailEvents.USER_SIGNUP_CONFIRMATION, {
      user: {
        _id: userDocument._id,
        firstName: userDocument.firstName,
        email: userDocument.email,
        __v: userDocument.__v,
      },
      token,
    });

    // replying
    reply.code(201);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'User created',
    };
  };

  // creating the rout
  fastify.route<{ Body: SignupBody }>({
    method: 'POST',
    url: '/new-user',
    schema: {
      body: fastify.getSchema(Schemas.SIGNUP_SCHEMA),
      response: Generic2xxSchema,
    },
    handler: signup,
  });
};
