import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.origin') || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Market Summary API')
    .setDescription('Real-time market data and financial news aggregation API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('market', 'Market data endpoints')
    .addTag('news', 'Financial news endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('user', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`🚀 Market Summary API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
