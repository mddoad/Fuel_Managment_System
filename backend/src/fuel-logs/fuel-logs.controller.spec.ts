import { Test, TestingModule } from '@nestjs/testing';
import { FuelLogsController } from './fuel-logs.controller';

describe('FuelLogsController', () => {
  let controller: FuelLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuelLogsController],
    }).compile();

    controller = module.get<FuelLogsController>(FuelLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
