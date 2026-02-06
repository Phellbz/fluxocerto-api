import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/** Lista de origens permitidas (CSV em FRONTEND_ORIGINS). Vazio = modo permissivo (qualquer origem). */
function getFrontendOriginsList(): string[] {
  const env = process.env.FRONTEND_ORIGINS?.trim();
  if (!env) return [];
  return env
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Callback dinâmico para CORS: origem na lista ou FRONTEND_ORIGINS vazio ou origin undefined (curl/postman) => permitir. */
function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean | string) => void,
) {
  const list = getFrontendOriginsList();
  if (origin === undefined) {
    return callback(null, true);
  }
  if (list.length === 0) {
    return callback(null, true);
  }
  if (list.includes(origin)) {
    return callback(null, origin);
  }
  callback(null, false);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: corsOriginCallback,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id', 'X-System-Bootstrap-Secret'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
