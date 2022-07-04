import Fastify from 'fastify';
import { join } from 'path';
import 'dotenv/config';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import auth from '@fastify/auth';
import bcrypt from 'fastify-bcrypt';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import amqp from 'fastify-amqp';
import cors from '@fastify/cors';

const fastify = Fastify({ maxParamLength: 300, ajv: { plugins: [require('ajv-formats')] } });

// registering plugins
fastify.register(sensible);

fastify.register(cors, {
  origin: 'http://api-gateway-svc:3000',
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
});

fastify.register(bcrypt, {
  saltWorkFactor: 12,
});

fastify.register(jwt, {
  secret: 'secret',
  cookie: {
    cookieName: 'auth',
    signed: false,
  },
});
fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET,
});

fastify.register(amqp, {
  hostname: process.env.RABBITMQ_HOST,
});

fastify.register(import('./plugins/errors/ajv'));
fastify.register(import('./plugins/errors/validation-errors'));
fastify.register(import('./plugins/schemas'));
fastify.register(import('./plugins/tools'));
fastify.register(import('./plugins/preHandlers'));

fastify.register(auth);
fastify.register(autoload, {
  dir: join(__dirname, 'routes'),
});

export default fastify;
