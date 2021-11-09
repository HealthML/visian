import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  Param,
  Post,
} from "@nestjs/common";

import { TokensService } from "./tokens.service";

@Controller("tokens")
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  // TODO: Protect access
  @Post()
  public async createToken(@Body() body: { name: string }) {
    if (!body.name)
      throw new HttpException(
        "Missing parameter 'name'",
        HttpStatus.BAD_REQUEST,
      );
    const token = await this.tokensService.create(body.name);
    return token.token;
  }

  @Post(":token")
  public async logToken(@Param() params: { token: string }, @Ip() ip: string) {
    await this.tokensService.log(params.token, ip);
  }

  // TODO: Protect access
  @Get()
  public async getTokensLog() {
    const tokens = await this.tokensService.findAll();
    return tokens.map(
      (token) => `${token.name} (${token.token}): ${token.accessCount}`,
    );
  }

  // TODO: Protect access
  @Get(":token")
  public async getTokenLog(@Param() params: { token: string }) {
    const token = await this.tokensService.findOne(params.token);
    if (!token) {
      throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    }

    return `${token.token} belongs to ${token.name}. It has been accessed ${
      token.accessCount
    } time(s). The last access was on ${token.lastAccess?.toISOString()} from ${
      token.lastIP
    }`;
  }

  // TODO: Protect access
  @Delete(":token")
  public async deleteToken(@Param() params: { token: string }) {
    await this.tokensService.remove(params.token);
    return "OK";
  }
}
