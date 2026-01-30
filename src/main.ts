import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Origens permitidas para CORS. CSV em FRONTEND_ORIGINS (ex: "https://seu-app.netlify.app,https://studio-ai.google.com"). Em dev, localhost é acrescentado. */
function getAllowedOrigins(): string[] | true {
  const env = process.env.FRONTEND_ORIGINS?.trim();
  const list = env ? env.split(',').map((o) => o.trim()).filter(Boolean) : [];
  if (process.env.NODE_ENV !== 'production') {
    const localhost = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
    ];
    const combined = [...new Set([...list, ...localhost])];
    return combined.length ? combined : true;
  }
  return list.length ? list : [];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const origins = getAllowedOrigins();
  app.enableCors({
    origin: origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
