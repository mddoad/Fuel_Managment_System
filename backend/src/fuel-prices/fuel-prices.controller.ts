import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role.enum';
import { FuelPricesService } from './fuel-prices.service';
import { SetFuelPricesDto } from './dto/set-fuel-prices.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('fuel-prices')
export class FuelPricesController {
  constructor(private readonly fuelPricesService: FuelPricesService) {}

  // any logged in user can view prices
  @Get()
  list() {
    return this.fuelPricesService.list();
  }

  // ADMIN sets prices
  @Roles(Role.ADMIN)
  @Put()
  set(@Body() dto: SetFuelPricesDto) {
    return this.fuelPricesService.setPrices(dto);
  }
}