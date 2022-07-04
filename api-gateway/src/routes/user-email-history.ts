import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios, { AxiosError, AxiosRequestHeaders } from 'axios';

interface UrlParams {
  id: string;
}

export default async (fastify: FastifyInstance, opts = {}) => {
  const userEmailHistory = async (request: FastifyRequest<{ Params: UrlParams }>, reply: FastifyReply) => {
    // get the user by his id
    const [userError, userResponse] = await fastify.to(
      axios.get(`http://localhost:3000/user/${request.params.id}/user-profile`, {
        headers: request.headers as AxiosRequestHeaders,
      })
    );
    if (userError) return userError;

    // get the email list by the user id
    const [emailError, emailResponse] = await fastify.to(
      axios.get(`http://localhost:3000/emails/${request.params.id}/user-email-list`, {
        headers: request.headers as AxiosRequestHeaders,
      })
    );
    if (emailError) return emailError;

    // sending the reply
    reply.status(200);
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Successfully got the user email history',
      data: {
        user: userResponse.data.user,
        emails: emailResponse.data.emails,
      },
    };
  };

  fastify.route<{ Params: UrlParams }>({
    method: 'GET',
    url: '/:id/user-email-history',
    handler: userEmailHistory,
  });
};
