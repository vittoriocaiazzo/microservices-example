import Fastify from 'fastify';
import 'dotenv/config';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import auth from '@fastify/auth';
import amqp from 'fastify-amqp';
import mailer from 'fastify-mailer';
import cors from '@fastify/cors';

const fastify = Fastify();

// registering plugins
fastify.register(sensible);

fastify.register(cors, {
  origin: 'http://api-gateway-svc:3000',
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
});

fastify.register(auth);

fastify.register(mailer, {
  transport: {
    host: process.env.MAILHOG_URI,
    port: 1025,
  },
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
  hostname: 'rabbitmq-svc',
});

fastify.register(import('@fastify/mongodb'), {
  url: process.env.MONGO_URI,
});
fastify.register(import('./plugins/mongodb'));

fastify.register(import('./plugins/event-listener'));
fastify.register(import('./plugins/event-functions'));
fastify.register(import('./plugins/preHandlers'));

fastify.register(import('./routes/user-email-list'));

export default fastify;
