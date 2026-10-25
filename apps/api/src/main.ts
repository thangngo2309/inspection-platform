
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const port = Number(config.get<string>('API_PORT', '9000'));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      config.get<string>('ADMIN_URL', 'http://localhost:9001'),
      config.get<string>('WEB_URL', 'http://localhost:9002'),
    ],
    credentials: true,
  });

  await app.listen(port);

  console.log(`API running at http://localhost:${port}/api`);
}

void bootstrap();
