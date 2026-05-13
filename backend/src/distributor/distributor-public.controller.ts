import { Controller, Get } from '@nestjs/common';
import { DistributorService } from './distributor.service';

@Controller('public/distributors')
export class DistributorPublicController {
  constructor(private readonly distributorService: DistributorService) {}

  @Get('stations')
  listStations() {
    return this.distributorService.listApprovedStations();
  }
}