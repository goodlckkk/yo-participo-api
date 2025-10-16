import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { Participation } from './entities/participation.entity';
import { Trial } from '../trials/entities/trial.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ParticipationsService {
  constructor(
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  async create(createParticipationDto: CreateParticipationDto) {
    const { patientId, trialId } = createParticipationDto;

    const participation = this.participationRepository.create({
      patient: { id: patientId } as User,
      trial: { id: trialId } as Trial,
    });

    return this.participationRepository.save(participation);
  }

  async findAll() {
    const participations = await this.participationRepository.find({
      relations: ['patient', 'trial'],
    });

    return participations.map((participation) => {
      const patient = participation.patient as Partial<User> | undefined;
      if (patient && 'password' in patient) {
        delete patient.password;
      }
      return participation;
    });
  }

  async remove(id: string) {
    const participation = await this.participationRepository.findOne({
      where: { id },
    });

    if (!participation) {
      throw new NotFoundException(`Participación con ID "${id}" no encontrada.`);
    }

    await this.participationRepository.remove(participation);
  }

  async findOne(id: string) {
    const participation = await this.participationRepository.findOne({
      where: { id },
      relations: ['patient', 'trial'],
    });

    if (!participation) {
      throw new NotFoundException(`Participación con ID "${id}" no encontrada.`);
    }

    const patient = participation.patient as Partial<User> | undefined;
    if (patient && 'password' in patient) {
      delete patient.password;
    }

    return participation;
  }

  async update(id: string, updateParticipationDto: UpdateParticipationDto) {
    const participation = await this.participationRepository.findOne({
      where: { id },
    });

    if (!participation) {
      throw new NotFoundException(`Participación con ID "${id}" no encontrada.`);
    }

    participation.status = updateParticipationDto.status;

    return this.participationRepository.save(participation);
  }
}
