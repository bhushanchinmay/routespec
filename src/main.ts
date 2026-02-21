import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './common/openapi/swagger.setup';
import { setupVersioning } from './common/versioning/versioning.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupVersioning(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
