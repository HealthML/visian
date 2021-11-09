import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import shortid from "shortid";
import { Repository, UpdateResult } from "typeorm";

import { TokenEntity } from "./token.entity";

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokensRepository: Repository<TokenEntity>,
  ) {}

  public async create(name: string, isActive = true): Promise<TokenEntity> {
    const token = new TokenEntity();
    token.token = shortid.generate();
    token.name = name;
    token.isActive = isActive;

    return this.tokensRepository.save(token);
  }

  public findAll() {
    return this.tokensRepository.find();
  }

  public findOne(token: string): Promise<TokenEntity | undefined> {
    return this.tokensRepository.findOne(token);
  }

  public async log(
    token: string,
    ip: string,
  ): Promise<TokenEntity | undefined> {
    const tokenObj = await this.tokensRepository.findOne(token);
    if (!tokenObj?.isActive) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    tokenObj.accessCount++;
    tokenObj.lastIP = ip;
    tokenObj.lastAccess = new Date();
    return this.tokensRepository.save(tokenObj);
  }

  public async setActive(
    token: string,
    isActive = true,
  ): Promise<UpdateResult> {
    return this.tokensRepository.update(token, { isActive });
  }

  public async remove(token: string): Promise<void> {
    await this.tokensRepository.delete(token);
  }
}
