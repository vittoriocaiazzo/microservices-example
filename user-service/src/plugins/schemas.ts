import fp from 'fastify-plugin';
import { Type, Static } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

export enum Schemas {
  SIGNUP_SCHEMA = 'signup_schema',
  LOGIN_SCHEMA = 'login_schema',
  FORGOT_PASSWORD_SCHEMA = 'forgot_password_schema',
  RESET_PASSWORD_SCHEMA = 'reset_password_schema',
  CHANGE_EMAIL_SCHEMA = 'change_email_schema',
  CHANGE_NAME_SCHEMA = 'change_name_schema',
  CHANGE_PASSWORD_SCHEMA = 'change_password_schema',

  GENERIC_2XX_RESPONSE_SCHEMA = 'generic_2xx_response_schema',
  MY_PROFILE_RESPONSE_SCHEMA = 'my_profile_response_schema',
}

const myMessages = {
  firstName: { required: 'Please provide your first name' },
  lastName: { required: 'Please provide your last name' },
  age: { required: 'Please provide your age', minimum: 'You must be at least 18 years old' },
  sex: { required: 'Please provide your gender' },
  email: { format: 'Please provide a valid email address', required: 'Please provide your email address' },
  username: { required: 'Please provide a username' },
  password: {
    required: 'Please provide a password',
    minLength: 'Your password must contains at least 8 characters',
    pattern:
      'Your password must contains at least one lowercase letter, one uppercase letter, one number and one symbol',
  },
  passwordConfirm: { required: 'Please confirm your password', const: 'Passwords do not match' },
};

const SignupSchema = Type.Object(
  {
    firstName: Type.String({
      minLength: 1,
      errorMessage: { minLength: myMessages.firstName.required },
    }),
    lastName: Type.String({ minLength: 1, errorMessage: { minLength: myMessages.lastName.required } }),
    age: Type.Number({ minimum: 18, errorMessage: { minimum: myMessages.age.minimum } }),
    sex: Type.String({ minLength: 1, errorMessage: { minLength: myMessages.sex.required } }),
    username: Type.String({ minLength: 1, errorMessage: { minLength: myMessages.username.required } }),
    email: Type.String({ format: 'email', errorMessage: { format: myMessages.email.format } }),
    password: Type.String({
      minLength: 8,
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
      errorMessage: {
        minLength: myMessages.password.minLength,
        pattern: myMessages.password.pattern,
      },
    }),
    passwordConfirm: Type.String({
      const: { $data: '1/password' },
      errorMessage: { const: myMessages.passwordConfirm.const },
    }),
    role: Type.Object({
      type: Type.String({ default: 'standard' }),
      level: Type.Optional(Type.Number()),
    }),
    isActive: Type.Boolean({ default: false }),
  },
  {
    $id: Schemas.SIGNUP_SCHEMA,
    errorMessage: {
      required: {
        firstName: myMessages.firstName.required,
        lastName: myMessages.lastName.required,
        age: myMessages.age.required,
        sex: myMessages.sex.required,
        username: myMessages.username.required,
        email: myMessages.email.required,
        password: myMessages.password.required,
        passwordConfirm: myMessages.passwordConfirm.required,
      },
    },
  }
);

const LoginSchema = Type.Object(
  {
    email: Type.String({ format: 'email', errorMessage: { format: myMessages.email.format } }),
    password: Type.String({
      minLength: 8,
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
      errorMessage: {
        pattern:
          'Your password must contains at least one lowercase letter, one uppercase letter, one number and one symbol',
      },
    }),
  },
  {
    $id: Schemas.LOGIN_SCHEMA,
    errorMessage: {
      required: {
        email: myMessages.email.required,
        password: myMessages.password.required,
      },
    },
  }
);

const ForgotPasswordSchema = Type.Object(
  {
    email: Type.String({ format: 'email', errorMessage: { format: myMessages.email.format } }),
  },
  {
    $id: Schemas.FORGOT_PASSWORD_SCHEMA,
    errorMessage: {
      required: {
        email: myMessages.email.required,
      },
    },
  }
);

const ResetPasswordSchema = Type.Object(
  {
    password: Type.String({
      minLength: 8,
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
      errorMessage: {
        pattern:
          'Your password must contains at least one lowercase letter, one uppercase letter, one number and one symbol',
      },
    }),
    passwordConfirm: Type.String({
      const: { $data: '1/password' },
      errorMessage: { const: myMessages.passwordConfirm.const },
    }),
  },
  {
    $id: Schemas.RESET_PASSWORD_SCHEMA,
    errorMessage: {
      required: {
        password: myMessages.password.required,
        passwordConfirm: myMessages.passwordConfirm.required,
      },
    },
  }
);

const ChangeEmailSchema = Type.Object(
  {
    email: Type.String({ format: 'email', errorMessage: { format: myMessages.email.format } }),
  },
  {
    $id: Schemas.CHANGE_EMAIL_SCHEMA,
    errorMessage: {
      required: {
        email: myMessages.email.required,
      },
    },
  }
);

const ChangeNameSchema = Type.Object(
  {
    firstName: Type.String({
      minLength: 1,
      errorMessage: { minLength: myMessages.firstName.required },
    }),
    lastName: Type.String({ minLength: 1, errorMessage: { minLength: myMessages.lastName.required } }),
  },
  {
    $id: Schemas.CHANGE_NAME_SCHEMA,
    errorMessage: {
      required: {
        firstName: myMessages.firstName.required,
        lastName: myMessages.lastName.required,
      },
    },
  }
);

const ChangePasswordSchema = Type.Object(
  {
    oldPassword: Type.String({
      minLength: 8,
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
      errorMessage: {
        minLength: myMessages.password.minLength,
        pattern: myMessages.password.pattern,
      },
    }),
    newPassword: Type.String({
      minLength: 8,
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
      errorMessage: {
        minLength: myMessages.password.minLength,
        pattern: myMessages.password.pattern,
      },
    }),
    passwordConfirm: Type.String({
      const: { $data: '1/password' },
      errorMessage: { const: myMessages.passwordConfirm.const },
    }),
  },
  {
    $id: Schemas.CHANGE_PASSWORD_SCHEMA,
    errorMessage: {
      required: {
        oldPassword: myMessages.password.required,
        newPassword: myMessages.password.required,
        passwordConfirm: myMessages.passwordConfirm.required,
      },
    },
  }
);

export const Generic2xxSchema = {
  '2xx': {
    type: 'object',
    additionalProperties: false,
    properties: {
      statusCode: { type: 'number', minimum: 200, maximum: 299 },
      statusMessage: { type: 'string' },
      message: { type: 'string' },
    },
  },
};

export const MyProfileSchema = {
  '200': {
    type: 'object',
    additionalProperties: false,
    properties: {
      statusCode: { type: 'number', minimum: 200, maximum: 299 },
      statusMessage: { type: 'string' },
      message: { type: 'string' },
      myProfile: { type: 'object' },
    },
  },
};

export type SignupBody = Static<typeof SignupSchema>;
export type LoginBody = Static<typeof LoginSchema>;
export type ForgotPasswordBody = Static<typeof ForgotPasswordSchema>;
export type ResetPasswordBody = Static<typeof ResetPasswordSchema>;
export type ChangeEmailBody = Static<typeof ChangeEmailSchema>;
export type ChangeNameBody = Static<typeof ChangeNameSchema>;
export type ChangePasswordBody = Static<typeof ChangePasswordSchema>;

const schemas: FastifyPluginAsync = async (fastify, opts) => {
  fastify.addSchema(SignupSchema);
  fastify.addSchema(LoginSchema);
  fastify.addSchema(ForgotPasswordSchema);
  fastify.addSchema(ResetPasswordSchema);
  fastify.addSchema(ChangeEmailSchema);
  fastify.addSchema(ChangeNameSchema);
  fastify.addSchema(ChangePasswordSchema);
};

export default fp(schemas);
