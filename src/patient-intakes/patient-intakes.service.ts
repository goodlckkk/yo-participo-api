import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientIntake } from './entities/patient-intake.entity';
import { CreatePatientIntakeDto } from './dto/create-patient-intake.dto';

@Injectable()
export class PatientIntakesService {
  constructor(
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
  ) {}

  async create(createPatientIntakeDto: CreatePatientIntakeDto) {
    const intake = this.patientIntakeRepository.create({
      ...createPatientIntakeDto,
      direccion: createPatientIntakeDto.direccion ?? null,
      medicamentosActuales: createPatientIntakeDto.medicamentosActuales ?? null,
      alergias: createPatientIntakeDto.alergias ?? null,
      cirugiasPrevias: createPatientIntakeDto.cirugiasPrevias ?? null,
    });

    return this.patientIntakeRepository.save(intake);
  }

  async findAll() {
    return this.patientIntakeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const intake = await this.patientIntakeRepository.findOne({
      where: { id },
    });

    if (!intake) {
      throw new NotFoundException(`Solicitud de paciente con ID "${id}" no encontrada.`);
    }

    return intake;
  }

  async findByTrial(trialId: string) {
    return this.patientIntakeRepository.find({
      where: { trialId },
      order: { createdAt: 'DESC' },
    });
  }
}
