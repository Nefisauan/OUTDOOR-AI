import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { AuthGuard, type AuthenticatedRequest } from "./auth.guard";
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("register")
  @Header("Cache-Control", "no-store")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() body: unknown) {
    return this.auth.register(body);
  }
  @Post("login")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() body: unknown) {
    return this.auth.login(body);
  }
  @Post("logout")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  logout(@Req() req: AuthenticatedRequest) {
    return this.auth.logout(req.auth.tokenHash);
  }
}
