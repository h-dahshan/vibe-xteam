import { Injectable } from "@nestjs/common";

import { Example } from "@repo/api/example/entities/example.entity";

import { CreateExampleDto } from "@repo/api/example/dto/create-example.dto";
import { UpdateExampleDto } from "@repo/api/example/dto/update-example.dto";

@Injectable()
export class ExamplesService {
  private readonly _examples: Example[] = [
    {
      id: 0,
      title: "Docs",
      url: "https://turborepo.com/docs",
      description:
        "Find in-depth information about Turborepo features and API.",
    },
    {
      id: 1,
      title: "Learn",
      url: "https://turborepo.com/docs/handbook",
      description: "Learn more about monorepos with our handbook.",
    },
    {
      id: 2,
      title: "Templates",
      url: "https://turborepo.com/docs/getting-started/from-example",
      description:
        "Choose from over 15 examples and deploy with a single click.",
    },
    {
      id: 3,
      title: "Deploy",
      url: "https://vercel.com/new",
      description:
        "Instantly deploy your Turborepo to a shareable URL with Vercel.",
    },
  ];

  create(createExampleDto: CreateExampleDto) {
    return `This action adds a new example ${createExampleDto}`;
  }

  findAll() {
    return this._examples;
  }

  findOne(id: number) {
    return `This action returns a #${id} example`;
  }

  update(id: number, updateExampleDto: UpdateExampleDto) {
    return `This action updates a #${id} example ${updateExampleDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} example`;
  }
}
