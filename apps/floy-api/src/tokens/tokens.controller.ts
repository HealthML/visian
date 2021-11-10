import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { TokensService } from "./tokens.service";

@Controller("tokens")
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  // User Space

  @Get(":token")
  public async getToken(@Param() params: { token: string }) {
    const token = await this.tokensService.findOne(params.token);
    if (!token?.isActive) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    return "OK";
  }

  @Post(":token/consent")
  public async consent(@Param() params: { token: string }, @Ip() ip: string) {
    const token = await this.tokensService.findOne(params.token);
    if (!token?.isActive) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    await this.tokensService.consent(token, ip);
    return "OK";
  }

  @Post(":token")
  public async logToken(@Param() params: { token: string }) {
    await this.tokensService.log(params.token);
    return "OK";
  }

  // Admin Space

  @Post()
  @UseGuards(AuthGuard("basic"))
  public async createToken(@Body() body: { name: string }) {
    if (!body.name) {
      throw new HttpException("Missing field 'name'", HttpStatus.BAD_REQUEST);
    }
    const token = await this.tokensService.create(body.name);
    return token;
  }

  @Get()
  @UseGuards(AuthGuard("basic"))
  public async getTokensLog() {
    return this.tokensService.findAll();
  }

  @Get(":token/log")
  @UseGuards(AuthGuard("basic"))
  public async getTokenLog(@Param() params: { token: string }) {
    const token = await this.tokensService.findOne(params.token);
    if (!token) {
      throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    }

    const consents = await this.tokensService.findConsents(token);
    return { ...token, consents };
  }

  @Patch(":token")
  @UseGuards(AuthGuard("basic"))
  public async updateToken(
    @Param() params: { token: string },
    @Body() body: { isActive: boolean },
  ) {
    if (body.isActive === undefined) {
      throw new HttpException(
        "Missing field 'isActive'",
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.tokensService.setActive(params.token, body.isActive);
    return "OK";
  }
}
