import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrialsService } from './trials.service';
import { Trial } from './entities/trial.entity';

describe('TrialsService', () => {
  let service: TrialsService;
  let repository: jest.Mocked<Repository<Trial>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Trial>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrialsService,
        {
          provide: getRepositoryToken(Trial),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TrialsService>(TrialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
