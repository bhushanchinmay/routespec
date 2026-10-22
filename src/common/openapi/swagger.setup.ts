import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersModule } from '../../users/users.module';

export const SWAGGER_UI_PATH = 'docs';
export const SWAGGER_JSON_PATH = 'docs-json';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('RouteSpec API')
    .setDescription(
      'Lightweight API versioning example with explicit v1 and v2 users endpoints.',
    )
    .setVersion('1.0.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [UsersModule],
  });

  SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
    jsonDocumentUrl: SWAGGER_JSON_PATH,
  });
}
