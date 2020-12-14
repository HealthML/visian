import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateProjectInput } from "./dto/create-project.dto";
import { ProjectEntity } from "./project.entity";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
  ) {}

  create(createProjectDTO: CreateProjectInput): Promise<ProjectEntity> {
    const project = new ProjectEntity();
    project.name = createProjectDTO.name;

    return this.projectsRepository.save(project);
  }

  findAll() {
    return this.projectsRepository.find();
  }

  findOneById(id: string) {
    return this.projectsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
