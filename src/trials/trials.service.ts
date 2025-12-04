import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrialDto } from './dto/create-trial.dto';
import { UpdateTrialDto } from './dto/update-trial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trial, TrialStatus } from './entities/trial.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';

@Injectable()
export class TrialsService {
  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
  ) {}

  async create(createTrialDto: CreateTrialDto) {
    const { sponsor_id, research_site_id, ...trialData } = createTrialDto;

    const newTrial = this.trialRepository.create({
      ...trialData,
      // Solo asignar sponsor si se proporciona sponsor_id
      ...(sponsor_id && { sponsor: { id: sponsor_id } }),
      // Asignar research site (obligatorio)
      researchSite: { id: research_site_id },
    });

    return this.trialRepository.save(newTrial);
  }

  async findAll(status?: TrialStatus, page = 1, limit = 10) {
    const findOptions: FindManyOptions<Trial> = {
      relations: ['sponsor', 'researchSite'],
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

    // Contar pacientes inscritos para cada ensayo
    const trialsWithPatientCount = await Promise.all(
      data.map(async (trial) => {
        const patientCount = await this.patientIntakeRepository.count({
          where: { trialId: trial.id },
        });
        
        // Forzar serialización completa del objeto trial
        const trialPlain = JSON.parse(JSON.stringify(trial));
        
        return {
          ...trialPlain,
          current_participants: patientCount,
        };
      })
    );

    const totalPages = Math.ceil(totalItems / limitNumber) || 1;

    return {
      data: trialsWithPatientCount,
      totalItems,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    };
  }

  async findOne(id: string) {
    const trial = await this.trialRepository.findOne({
      where: { id },
      relations: ['sponsor', 'researchSite'],
    });

    if (!trial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    // Contar pacientes inscritos en este ensayo
    const patientCount = await this.patientIntakeRepository.count({
      where: { trialId: trial.id },
    });

    // Forzar serialización completa del objeto trial
    const trialPlain = JSON.parse(JSON.stringify(trial));

    return {
      ...trialPlain,
      current_participants: patientCount,
    };
  }

  async update(id: string, updateTrialDto: UpdateTrialDto) {
    const { sponsor_id, research_site_id, ...trialData } = updateTrialDto;

    const trial = await this.trialRepository.preload({
      id,
      ...trialData,
      // Solo actualizar sponsor si se proporciona sponsor_id
      ...(sponsor_id && { sponsor: { id: sponsor_id } }),
      // Solo actualizar research site si se proporciona research_site_id
      ...(research_site_id && { researchSite: { id: research_site_id } }),
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
