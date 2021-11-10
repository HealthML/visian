import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { ConsentEntity } from "./consent.entity";

import { TokenEntity } from "./token.entity";

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokensRepository: Repository<TokenEntity>,
    @InjectRepository(ConsentEntity)
    private consentsRepository: Repository<ConsentEntity>,
  ) {}

  public async create(name: string, isActive = true): Promise<TokenEntity> {
    const token = new TokenEntity({ name });
    token.isActive = isActive;

    return this.tokensRepository.save(token);
  }

  public findAll() {
    return this.tokensRepository.find();
  }

  public findOne(token: string): Promise<TokenEntity | undefined> {
    return this.tokensRepository.findOne(token);
  }

  public async consent(
    token: TokenEntity,
    ip: string,
  ): Promise<ConsentEntity | undefined> {
    const consent = new ConsentEntity({ token, ip });

    return this.consentsRepository.save(consent);
  }

  public async findConsents(token: TokenEntity): Promise<ConsentEntity[]> {
    return this.consentsRepository.find({ token });
  }

  public async log(token: string): Promise<TokenEntity | undefined> {
    const tokenObj = await this.tokensRepository.findOne(token);
    if (!tokenObj?.isActive || !(await this.findConsents(tokenObj)).length) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    tokenObj.accessCount++;
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
