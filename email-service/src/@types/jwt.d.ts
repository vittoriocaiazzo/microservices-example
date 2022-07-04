import { FastifyJWT } from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

interface role {
  type: string;
  level?: number;
}

interface payload {
  id: string;
  isActive: boolean;
  role: role;
}
interface user {
  id: string;
  isActive: boolean;
  role: role;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: payload;
    user: user;
  }
}

declare module 'fastify' {
  interface FastifyReply {
    authSign(payload: payload, options?: Partial<SignOptions> | undefined): Promise<string>;
    supportSign(payload: payload, options?: Partial<SignOptions> | undefined): Promise<string>;
  }
  interface FastifyRequest {
    authVerify<VerifyPayloadType>(options?: FastifyJwtVerifyOptions | undefined): Promise<VerifyPayloadType>;
    supportVerify<VerifyPayloadType>(options?: FastifyJwtVerifyOptions | undefined): Promise<VerifyPayloadType>;
  }
}
