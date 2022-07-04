import fastify from './app';

fastify.register(import('@fastify/mongodb'), {
  url: process.env.MONGO_URI,
});
fastify.register(import('./plugins/mongodb'));

fastify.register(import('./plugins/events/events'));

const start = async () => {
  process.env.PORT = process.env.PORT || '3000';

  try {
    await fastify.listen({
      host: '0.0.0.0',
      port: +process.env.PORT,
    });
    console.log('\n✅  Server listening on port ' + process.env.PORT);
  } catch (err) {
    console.log(err);
  }
};
start();
