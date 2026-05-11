import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { DistributorApplication } from './distributor-application.entity';
import { DistributorController } from './distributor.controller';
import { DistributorService } from './distributor.service';

@Module({
  imports: [TypeOrmModule.forFeature([DistributorApplication, User])],
  controllers: [DistributorController],
  providers: [DistributorService],
})
export class DistributorModule {}