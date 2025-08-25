import { Test, TestingModule } from "@nestjs/testing";

import { ExampleController } from "./example.controller";
import { ExamplesService } from "./example.service";

describe("ExampleController", () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [ExamplesService],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
