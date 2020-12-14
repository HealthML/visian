import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProjectEntity } from "./project.entity";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity])],
  exports: [ProjectsService],
  providers: [ProjectsService, ProjectsResolver],
})
export class ProjectsModule {}
