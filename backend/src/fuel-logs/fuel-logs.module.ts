import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelLogsController } from './fuel-logs.controller';
import { FuelLogsService } from './fuel-logs.service';
import { FuelLog } from './fuel-log.entity';
import { Station } from '../stations/station.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuelLog, Station, Vehicle, User])],
  controllers: [FuelLogsController],
  providers: [FuelLogsService],
})
export class FuelLogsModule {}