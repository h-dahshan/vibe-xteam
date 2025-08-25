import { Module } from "@nestjs/common";

import { ExamplesModule } from "./example/example.module";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";

@Module({
  imports: [ExamplesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
