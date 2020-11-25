import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getVersion() {
    return "0.0.1";
  }
}
