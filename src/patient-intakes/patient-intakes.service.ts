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
      relations: ['trial'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const intake = await this.patientIntakeRepository.findOne({
      where: { id },
      relations: ['trial'],
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

  /**
   * Actualiza un paciente (por ejemplo, asignar a un ensayo)
   */
  async update(id: string, updateData: Partial<PatientIntake>) {
    const intake = await this.findOne(id);
    
    // Actualizar los campos proporcionados
    Object.assign(intake, updateData);
    
    return this.patientIntakeRepository.save(intake);
  }

  /**
   * Elimina un paciente del sistema
   */
  async remove(id: string) {
    const intake = await this.findOne(id);
    await this.patientIntakeRepository.remove(intake);
    return { message: 'Paciente eliminado exitosamente' };
  }
}
