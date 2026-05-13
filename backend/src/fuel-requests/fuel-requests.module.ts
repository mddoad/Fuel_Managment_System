import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorProfile } from '../distributor/distributor-profile.entity';
import { FuelLog } from '../fuel-logs/fuel-log.entity';
import { FuelPrice } from '../fuel-prices/fuel-price.entity';
import { Station } from '../stations/station.entity';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { FuelRequestsController } from './fuel-requests.controller';
import { FuelRequestsService } from './fuel-requests.service';
import { FuelRequest } from './fuel-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelRequest,
      User,
      Vehicle,
      Station, 
      FuelPrice,
      FuelLog,
      DistributorProfile,
    ]),
  ],
  controllers: [FuelRequestsController],
  providers: [FuelRequestsService],
})
export class FuelRequestsModule {}