import fp from 'fastify-plugin';
import { EmailEvents, EmailEventObject } from '@vitto88/lib';

declare module 'fastify' {
  interface FastifyInstance {
    eventFunctions: {
      [s: string]: (eventObject: EmailEventObject) => Promise<any>;
    };
  }
}

const userURL = 'https://api.microservices-example.dev/user';

export default fp(async (fastify, opts) => {
  fastify.decorate('eventFunctions', {
    [EmailEvents.USER_SIGNUP_CONFIRMATION]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: 'Registration',
          text: `Hello ${eventObject.user.firstName}!
          Please click here to activate your account! ${userURL}/email-confirmation/${eventObject.token}`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_WELCOME]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Welcome to Let's Play It!!`,
          text: `Your account has been activated!`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_LOGIN]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Login Alert`,
          text: `You logged in.`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_FORGOT_PASSWORD]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Reset Password`,
          text: `Click on the link to reset your password. ${userURL}/reset-password/${eventObject.token}`,
        })
      );
      if (err) throw err;
    },
    [EmailEvents.USER_PASSWORD_RESET]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Password resetted successfully`,
          text: `You successfully resetted your password!`,
        })
      );
      if (err) throw err;
    },
    [EmailEvents.USER_EMAIL_CONFIRMATION]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: 'Email confirmation',
          text: `Hello ${eventObject.user.firstName}!
          Please click here to confirm your new email! ${userURL}/email-confirmation/${eventObject.token}`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_CHANGE_EMAIL_CONFIRMATION]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Email changed`,
          text: `Your successfully changed and confirmed your email!`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_CHANGE_NAME]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Name changed`,
          text: `Your successfully changed your name!`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.USER_CHANGE_PASSWORD]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Password changed`,
          text: `Your successfully changed your password!`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.ADMIN_SIGNUP_CONFIRMATION]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: 'Registration',
          text: `Hello ${eventObject.user.firstName}!
          Please click here to activate your account! ${userURL}/email-confirmation/${eventObject.token}`,
        })
      );
      if (err) return err;
    },
    [EmailEvents.ADMIN_FORGOT_PASSWORD]: async (eventObject: EmailEventObject) => {
      const [err] = await fastify.to(
        fastify.mailer.sendMail({
          from: 'support@letsplayit.org',
          to: eventObject.user.email,
          subject: `Reset Password`,
          text: `Click on the link to reset your password. ${userURL}/reset-password/${eventObject.token}`,
        })
      );
      if (err) throw err;
    },
  });
});
