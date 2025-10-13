import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';

export interface TestModuleOptions {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
}

export const createTestingModule = async (
  options: TestModuleOptions,
): Promise<TestingModule> => {
  const moduleBuilder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      ...(options.imports || []),
    ],
    controllers: options.controllers || [],
    providers: options.providers || [],
  });

  return moduleBuilder.compile();
};

export const createTestApp = async (
  module: TestingModule,
): Promise<INestApplication> => {
  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
};

export const getAuthToken = async (
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.access_token;
};

export const registerUser = async (
  app: INestApplication,
  userData: { email: string; password: string; name: string; role?: string },
): Promise<any> => {
  const response = await request(app.getHttpServer())
    .post('/v1/auth/register')
    .send(userData)
    .expect(201);

  return response.body;
};
