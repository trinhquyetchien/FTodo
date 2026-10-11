import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HTTP Security Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline scripts
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Hardened CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 3. Strict Global Validation Pipe & Mass Assignment Prevention
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips any unknown properties from payloads
      forbidNonWhitelisted: true, // Throws bad request error if unknown properties are sent
      transform: true, // Automatically transforms payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('FTodo API Documentation')
    .setDescription(
      'Nền tảng Quản trị Dự án Agile Scrum & Quản lý Công việc toàn diện. Cung cấp API cho Xác thực JWT, Quản lý Dự án, Sprint Backlog, Bảng Kanban, Chi phí & Ngân sách, Thành viên & Phân quyền RBAC, và Kênh trao đổi thời gian thực.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập access token theo định dạng: Bearer <token>',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Xác thực tài khoản, Đăng ký, Đăng nhập, JWT')
    .addTag('Projects', 'Quản lý Không gian Dự án và Cấu hình')
    .addTag('Tasks & Sprints', 'Quản lý Công việc Scrum, User Stories, Sprints')
    .addTag('Members', 'Quản trị Nhân sự, Nhóm quyền RBAC và Phân quyền')
    .addTag('Costs', 'Quản lý Chi phí, Đề xuất Ngân sách & Phê duyệt')
    .addTag('Chat', 'Kênh trao đổi & Tin nhắn dự án')
    .addTag('Users', 'Tra cứu & Quản lý Người dùng')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'FTodo Swagger OpenAPI Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Backend server is running on: http://localhost:${port}/api`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
