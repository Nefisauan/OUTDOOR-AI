import {
  Body,
  Controller,
  Get,
  Header,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard, type AuthenticatedRequest } from "../auth/auth.guard";
import { ProfileService } from "./profile.service";
@Controller("profile")
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}
  @Get() @Header("Cache-Control", "no-store") get(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.profiles.get(req.auth.userId);
  }
  @Post() @Header("Cache-Control", "no-store") create(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    return this.profiles.create(req.auth.userId, body);
  }
  @Patch() @Header("Cache-Control", "no-store") update(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    return this.profiles.update(req.auth.userId, body);
  }
}
