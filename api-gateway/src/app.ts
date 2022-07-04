import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import cors from '@fastify/cors';
import { join } from 'path';
const fastify = Fastify();

fastify.register(sensible);

fastify.register(httpProxy, {
  upstream: 'http://authentication-service-svc:3000',
  prefix: '/user/auth',
});

fastify.register(httpProxy, {
  upstream: 'http://user-service-svc:3000',
  prefix: '/user',
});

fastify.register(httpProxy, {
  upstream: 'http://email-service-svc:3000',
  prefix: '/emails',
});

fastify.register(autoload, {
  dir: join(__dirname, 'routes'),
});

export default fastify;
