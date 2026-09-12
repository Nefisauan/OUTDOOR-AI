import { Module } from "@nestjs/common";
import { EnvironmentModule } from "./config/environment.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profiles/profile.module";
@Module({
  imports: [EnvironmentModule, PrismaModule, AuthModule, ProfileModule],
  controllers: [HealthController],
})
export class AppModule {}
