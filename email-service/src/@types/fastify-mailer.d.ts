declare module 'fastify-mailer' {
  import { FastifyPluginCallback } from 'fastify';
  import { Transporter, TransportOptions } from 'nodemailer';

  export interface FastifyMailerOptions extends TransportOptions {
    transport: {
      host?: string;
      port: number;
    };
  }

  export interface FastifyMailerNamedInstance {
    [namespace: string]: Transporter;
  }
  export type FastifyMailer = FastifyMailerNamedInstance & Transporter;

  declare module 'fastify' {
    interface FastifyInstance {
      mailer: FastifyMailer;
    }
  }

  export const fastifyNodeMailer: FastifyPluginCallback<FastifyMailerOptions>;
  export default fastifyNodeMailer;
}
