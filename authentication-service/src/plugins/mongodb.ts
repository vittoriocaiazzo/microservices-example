import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AuthenticationDocument } from '@vitto88/lib';
import { Collection } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongodb: {
      insertUser: (user: AuthenticationDocument) => Promise<void>;
      updateUser: (user: AuthenticationDocument) => Promise<void>;
      getUserById: (id: string) => Promise<AuthenticationDocument>;
      getUserByEmail: (id: string) => Promise<AuthenticationDocument>;
    };
  }
}

const mongodb: FastifyPluginAsync = async (fastify, opts) => {
  if (!fastify.mongo.db) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable');
  let collection: Collection<AuthenticationDocument>;
  if (fastify.mongo.db.collection('users')) collection = fastify.mongo.db.collection<AuthenticationDocument>('users');
  else collection = await fastify.mongo.db.createCollection<AuthenticationDocument>('users');

  async function insertUser(authenticationDocument: AuthenticationDocument) {
    authenticationDocument._id = new fastify.mongo.ObjectId(authenticationDocument._id);
    const [insertError] = await fastify.to(collection.insertOne(authenticationDocument, { ignoreUndefined: true }));
    if (insertError) return new Error('MongoDB unavailable: user not created');
  }

  async function updateUser(authenticationDocument: AuthenticationDocument) {
    authenticationDocument._id = new fastify.mongo.ObjectId(authenticationDocument._id);
    const [updateError] = await fastify.to(
      collection.updateOne(
        { _id: authenticationDocument._id },
        { $set: authenticationDocument },
        { ignoreUndefined: true }
      )
    );
    if (updateError) return new Error('MongoDB unavailable: user not updated');
  }

  async function getUserById(id: string) {
    const [findError, user] = await fastify.to(collection.findOne({ _id: new fastify.mongo.ObjectId(id) }));
    if (findError) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable: user created');
    if (!user) throw fastify.httpErrors.notFound('User not found');
    return user;
  }

  async function getUserByEmail(email: string) {
    const [findError, user] = await fastify.to(collection.findOne({ email }));
    if (findError) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable');
    if (!user) throw fastify.httpErrors.unauthorized('Incorrect email or password');
    return user;
  }

  fastify.decorate('mongodb', {
    insertUser,
    updateUser,
    getUserById,
    getUserByEmail,
  });
};

export default fp(mongodb);
