import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { DistributorApplication } from './distributor-application.entity';
import { DistributorController } from './distributor.controller';
import { DistributorService } from './distributor.service';
import { DistributorProfile } from './diatributor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributorApplication, DistributorProfile, User])],
  controllers: [DistributorController],
  providers: [DistributorService],
})
export class DistributorModule {}