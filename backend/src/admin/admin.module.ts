import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorProfile } from '../distributor/diatributor-profile.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User, DistributorProfile])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}