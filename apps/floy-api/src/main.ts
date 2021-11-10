import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import fs from "fs";

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const httpsOptions =
    process.env.SSL_KEY && process.env.SSL_CERT
      ? {
          key: fs.readFileSync(process.env.SSL_KEY),
          cert: fs.readFileSync(process.env.SSL_CERT),
        }
      : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}`);
  });
}

bootstrap();
