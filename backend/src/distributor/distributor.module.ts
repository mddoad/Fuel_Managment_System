import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { DistributorApplication } from './distributor-application.entity';
import { DistributorController } from './distributor.controller';
import { DistributorService } from './distributor.service';
import { DistributorProfile } from './distributor-profile.entity';
import { Station } from '../stations/station.entity';
import { DistributorPublicController } from './distributor-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DistributorApplication, DistributorProfile, User, Station])],
  controllers: [DistributorController, DistributorPublicController],
  providers: [DistributorService],
})
export class DistributorModule {}