import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrialDto } from './dto/create-trial.dto';
import { UpdateTrialDto } from './dto/update-trial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trial, TrialStatus } from './entities/trial.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class TrialsService {
  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
  ) {}

  async create(createTrialDto: CreateTrialDto) {
    const { sponsor_id, ...trialData } = createTrialDto;

    const newTrial = this.trialRepository.create({
      ...trialData,
      // Solo asignar sponsor si se proporciona sponsor_id
      ...(sponsor_id && { sponsor: { id: sponsor_id } }),
    });

    return this.trialRepository.save(newTrial);
  }

  async findAll(status?: TrialStatus, page = 1, limit = 10) {
    const findOptions: FindManyOptions<Trial> = {
      relations: ['sponsor'],
    };

    if (status) {
      findOptions.where = {
        status,
      };
    }

    const pageNumber = page > 0 ? page : 1;
    const limitNumber = limit > 0 ? limit : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [data, totalItems] = await this.trialRepository.findAndCount({
      ...findOptions,
      take: limitNumber,
      skip,
    });

    const totalPages = Math.ceil(totalItems / limitNumber) || 1;

    return {
      data,
      totalItems,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    };
  }

  async findOne(id: string) {
    const trial = await this.trialRepository.findOne({
      where: { id },
      relations: ['sponsor'],
    });

    if (!trial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    return trial;
  }

  async update(id: string, updateTrialDto: UpdateTrialDto) {
    const trial = await this.trialRepository.preload({
      id,
      ...updateTrialDto,
    });

    if (!trial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    return this.trialRepository.save(trial);
  }

  async remove(id: string) {
    const trial = await this.findOne(id);
    await this.trialRepository.remove(trial);
  }
}
