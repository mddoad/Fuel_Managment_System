import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorProfile } from '../distributor/distributor-profile.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Station } from 'src/stations/station.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User, DistributorProfile, Station])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}