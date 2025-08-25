import { Example } from "./example/entities/example.entity";

import { CreateExampleDto } from "./example/dto/create-example.dto";
import { UpdateExampleDto } from "./example/dto/update-example.dto";

export const example = {
  dto: {
    CreateExampleDto,
    UpdateExampleDto,
  },
  entities: {
    Example,
  },
};
