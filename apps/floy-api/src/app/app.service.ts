import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  public getVersion() {
    return "0.0.1";
  }
}
