import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserDocument, AuthenticationDocument } from '@vitto88/lib';
import { SignupBody } from './schemas';
import { Collection, ObjectId } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongodb: {
      createUserDocument: (signupBody: SignupBody) => UserDocument;
      createAuthenticationDocument: (user: UserDocument) => AuthenticationDocument;
      checkExistingUser: (user: UserDocument) => Promise<Error | void>;
      insertUser: (user: UserDocument) => Promise<Error | void>;
      getUserById: (id: string) => Promise<UserDocument>;
      getUserByEmail: (email: string) => Promise<UserDocument>;
      updateUser: (user: UserDocument) => Promise<void>;
    };
  }
}

const mongodb: FastifyPluginAsync = async (fastify, opts) => {
  if (!fastify.mongo.db) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable');
  let collection: Collection<UserDocument>;
  if (fastify.mongo.db.collection('users')) collection = fastify.mongo.db.collection<UserDocument>('users');
  else collection = await fastify.mongo.db.createCollection<UserDocument>('users');

  function createUserDocument(signupBody: SignupBody): UserDocument {
    const user: UserDocument = {
      _id: new fastify.mongo.ObjectId(),
      firstName: signupBody.firstName,
      lastName: signupBody.lastName,
      age: signupBody.age,
      sex: signupBody.sex,
      email: signupBody.email,
      username: signupBody.username,
      password: signupBody.password,
      role: {
        type: signupBody.role.type,
        level: signupBody.role.level,
      },
      isActive: signupBody.isActive,
      __v: 0,
    };
    if (!user.role.level) delete user.role.level;
    return user;
  }

  function createAuthenticationDocument(user: UserDocument): AuthenticationDocument {
    const authenticationDocument: AuthenticationDocument = {
      _id: user._id,
      email: user.email,
      username: user.username,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      __v: user.__v,
    };
    return authenticationDocument;
  }

  async function checkExistingUser(user: UserDocument): Promise<Error | void> {
    if (await collection.findOne({ email: user.email }))
      throw fastify.httpErrors.conflict('Email address already in use');
    if (await collection.findOne({ username: user.username }))
      throw fastify.httpErrors.conflict('Username already in use');
  }

  async function insertUser(user: UserDocument): Promise<Error | void> {
    if (typeof user._id === 'string') user._id = new fastify.mongo.ObjectId(user._id);
    const [insertError] = await fastify.to(collection.insertOne(user));
    if (insertError) Promise.reject(new Error('MongoDB unavailable: user not created'));
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

  async function updateUser(user: UserDocument) {
    const [updateError] = await fastify.to(collection.updateOne({ _id: user._id }, { $set: user }));
    if (updateError) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable: user not updated');
  }

  fastify.decorate('mongodb', {
    createUserDocument,
    createAuthenticationDocument,
    checkExistingUser,
    insertUser,
    getUserById,
    updateUser,
    getUserByEmail,
  });
};

export default fp(mongodb);
