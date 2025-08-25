import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ExamplesService } from "./example.service";

import { CreateExampleDto } from "@repo/api/example/dto/create-example.dto";
import { UpdateExampleDto } from "@repo/api/example/dto/update-example.dto";

@Controller("examples")
export class ExampleController {
  constructor(private readonly exampleService: ExamplesService) {}

  @Post()
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.create(createExampleDto);
  }

  @Get()
  findAll() {
    return this.exampleService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.exampleService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateExampleDto: UpdateExampleDto) {
    return this.exampleService.update(+id, updateExampleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.exampleService.remove(+id);
  }
}
