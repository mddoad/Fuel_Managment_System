import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelPrice } from './fuel-price.entity';
import { FuelPricesController } from './fuel-prices.controller';
import { FuelPricesService } from './fuel-prices.service';

@Module({
  imports: [TypeOrmModule.forFeature([FuelPrice])],
  controllers: [FuelPricesController],
  providers: [FuelPricesService],
})
export class FuelPricesModule {}