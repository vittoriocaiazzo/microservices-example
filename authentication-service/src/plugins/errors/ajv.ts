import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { FastifyValidationResult } from 'fastify/types/schema';

declare module 'fastify' {
  interface FastifyInstance {
    ajv: Ajv;
  }
}

const ajvPlugin: FastifyPluginAsync = async (fastify, opts) => {
  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    strict: false,
    $data: true,
  });
  addFormats(ajv);
  addErrors(ajv);

  fastify.decorate('ajv', ajv);
  fastify.setValidatorCompiler((opts) => ajv.compile(opts.schema) as FastifyValidationResult);
};

export default fp(ajvPlugin);
