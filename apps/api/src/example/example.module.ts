import { Module } from "@nestjs/common";

import { ExamplesService } from "./example.service";
import { ExampleController } from "./example.controller";

@Module({
  controllers: [ExampleController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
