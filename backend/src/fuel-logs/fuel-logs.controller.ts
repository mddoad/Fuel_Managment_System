import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FuelLogsService } from './fuel-logs.service';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('fuel-logs')
export class FuelLogsController {
  constructor(private readonly fuelLogsService: FuelLogsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateFuelLogDto) {
    // req.user is what you return from JwtStrategy.validate()
    return this.fuelLogsService.create(req.user.id, dto);
  }

  @Get()
  findAll() {
    return this.fuelLogsService.findAll();
  }

  @Get('mine')
  mine(@Request() req: any) {
    return this.fuelLogsService.findMine(req.user.id);
  }
}