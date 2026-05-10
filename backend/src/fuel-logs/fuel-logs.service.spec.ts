import { Test, TestingModule } from '@nestjs/testing';
import { FuelLogsService } from './fuel-logs.service';

describe('FuelLogsService', () => {
  let service: FuelLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FuelLogsService],
    }).compile();

    service = module.get<FuelLogsService>(FuelLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
