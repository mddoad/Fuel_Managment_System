import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role.enum';
import { CreateFuelRequestDto } from './dto/create-fuel-request.dto';
import { FuelRequestsService } from './fuel-requests.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('fuel-requests')
export class FuelRequestsController {
  constructor(private readonly fuelRequestsService: FuelRequestsService) {}

  // USER creates request
  @Roles(Role.USER)
  @Post()
  create(@Request() req: any, @Body() dto: CreateFuelRequestDto) {
    return this.fuelRequestsService.create(req.user.id, dto);
  }

  // USER sees own requests
  @Roles(Role.USER)
  @Get('mine')
  mine(@Request() req: any) {
    return this.fuelRequestsService.mine(req.user.id);
  }

  // DISTRIBUTOR sees pending (for now global)
  @Roles(Role.DISTRIBUTOR)
  @Get('pending')
  pending() {
    return this.fuelRequestsService.pendingForDistributor();
  }

  // DISTRIBUTOR accepts
  @Roles(Role.DISTRIBUTOR)
  @Post(':id/accept')
  accept(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.fuelRequestsService.accept(req.user.id, id);
  }

  // DISTRIBUTOR completes (creates FuelLog)
  @Roles(Role.DISTRIBUTOR)
  @Post(':id/complete')
  complete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.fuelRequestsService.complete(req.user.id, id);
  }

  // DISTRIBUTOR rejects
  @Roles(Role.DISTRIBUTOR)
  @Post(':id/reject')
  reject(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.fuelRequestsService.reject(req.user.id, id);
  }
  
  @Roles(Role.DISTRIBUTOR)
  @Get('accepted')
  accepted(@Request() req: any) {
  return this.fuelRequestsService.acceptedByDistributor(req.user.id);
}
  
}