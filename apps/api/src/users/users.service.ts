import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateUserInput } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  create(createUserDTO: CreateUserInput): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = createUserDTO.email;
    user.name = createUserDTO.name;
    // TODO: Hash!
    user.password = createUserDTO.password;

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  findOneById(id: string) {
    return this.usersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
