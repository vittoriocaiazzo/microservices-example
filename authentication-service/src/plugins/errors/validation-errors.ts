import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

class ValidationErrors extends Error {
  constructor(public messages: (string | undefined)[]) {
    super('Validation Error');
  }
  statusCode = 400;
  statusMessage = 'Bad Request';
  reply = {
    statusCode: this.statusCode,
    statusMessage: this.statusMessage,
    messages: this.messages,
  };
}

const errorsPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.setSchemaErrorFormatter((errors, dataVar) => new ValidationErrors(errors.map((error) => error.message)));
  fastify.setErrorHandler(async (error, request, reply) => {
    if (error instanceof ValidationErrors) {
      reply.status(error.statusCode);
      return error.reply;
    }
    return error;
  });
};

export default fp(errorsPlugin);
