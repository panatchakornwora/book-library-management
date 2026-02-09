import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const httpLogger = pinoHttp();
  app.use(httpLogger);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const rootPublic = join(process.cwd(), 'public');
  const monoPublic = join(process.cwd(), 'backend', 'public');
  const publicPath = existsSync(rootPublic) ? rootPublic : monoPublic;
  app.useStaticAssets(publicPath);

  const swaggerPath = process.env.SWAGGER_PATH || 'api';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('Book Library Management API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, swaggerDocument);

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  httpLogger.logger.info(`API running at http://localhost:${port}`);
  httpLogger.logger.info(`Swagger at http://localhost:${port}/${swaggerPath}`);
}

void bootstrap();
