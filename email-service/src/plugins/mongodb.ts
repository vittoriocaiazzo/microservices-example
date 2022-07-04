import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EmailDocument, EmailEventObject } from '@vitto88/lib';
import { Collection } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongodb: {
      createEmailDocument(eventObject: EmailEventObject, type: string): EmailDocument;
      insertEmail(email: EmailDocument): Promise<void | Error>;
      getUserEmailList(id: string): Promise<EmailDocument[]>;
    };
  }
}

const mongodb: FastifyPluginAsync = async (fastify, opts) => {
  if (!fastify.mongo.db) throw fastify.httpErrors.serviceUnavailable('MongoDB unavailable');
  let collection: Collection<EmailDocument>;
  if (fastify.mongo.db.collection('emails')) collection = fastify.mongo.db.collection<EmailDocument>('emails');
  else collection = await fastify.mongo.db.createCollection<EmailDocument>('emails');

  function createEmailDocument(eventObject: EmailEventObject, type: string): EmailDocument {
    const email: EmailDocument = {
      _id: new fastify.mongo.ObjectId(),
      type,
      timestamp: new Date(),
      user: {
        _id: eventObject.user._id,
        __v: eventObject.user.__v,
      },
      __v: 0,
    };
    return email;
  }

  async function insertEmail(email: EmailDocument): Promise<void | Error> {
    const [err] = await fastify.to(collection.insertOne(email));
    if (err) return new Error();
  }

  async function getUserEmailList(id: string): Promise<EmailDocument[]> {
    const [err, emails] = await fastify.to(collection.find({ 'user._id': new fastify.mongo.ObjectId(id) }).toArray());
    if (err) throw fastify.httpErrors.serviceUnavailable('Mongodb unavailable');
    console.log(emails);
    return emails;
  }

  fastify.decorate('mongodb', {
    createEmailDocument,
    insertEmail,
    getUserEmailList,
  });
};

export default fp(mongodb);
