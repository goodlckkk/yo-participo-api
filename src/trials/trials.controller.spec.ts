import { Test, TestingModule } from '@nestjs/testing';
import { TrialsController } from './trials.controller';
import { TrialsService } from './trials.service';

describe('TrialsController', () => {
  let controller: TrialsController;
  let service: Partial<Record<keyof TrialsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as Partial<Record<keyof TrialsService, jest.Mock>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrialsController],
      providers: [
        {
          provide: TrialsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TrialsController>(TrialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
