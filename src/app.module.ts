import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Sponsor } from './sponsors/entities/sponsor.entity';
import { User } from './users/entities/user.entity';
import { Trial } from './trials/entities/trial.entity';
import { PatientIntake } from './patient-intakes/entities/patient-intake.entity';
import { PatientIntakesModule } from './patient-intakes/patient-intakes.module';
import { TrialsModule } from './trials/trials.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { ResearchSitesModule } from './research-sites/research-sites.module';
import { ResearchSite } from './research-sites/entities/research-site.entity';
import { Cie10Module } from './cie10/cie10.module';
import { Cie10Code } from './cie10/entities/cie10-code.entity';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { HeroSlide } from './hero-slides/entities/hero-slide.entity';
import { SuccessStoriesModule } from './success-stories/success-stories.module';
import { SuccessStory } from './success-stories/entities/success-story.entity';
import { EmailsModule } from './emails/emails.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuditLog } from './audit-logs/entities/audit-log.entity';

@Module({
  imports: [
    // 1. Módulo para cargar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
    }),

    // 2. Rate Limiting - Protección contra fuerza bruta
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: parseInt(config.get('THROTTLE_TTL') || '60', 10) * 1000, // 60 segundos
        limit: parseInt(config.get('THROTTLE_LIMIT') || '1000', 10), // 1000 requests por minuto (aumentado para dashboard con múltiples peticiones simultáneas y varios usuarios)
      }],
    }),

    // 3. Módulo de TypeORM para la conexión a la base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [Sponsor, User, Trial, PatientIntake, ResearchSite, Cie10Code, HeroSlide, SuccessStory, AuditLog],
        synchronize: false, // SIEMPRE false - usamos migraciones
        ssl: {
          rejectUnauthorized: false,
        },
      } as TypeOrmModuleOptions),
    }),

    TrialsModule,
    UsersModule,
    AuthModule,
    PatientIntakesModule,
    StatsModule,
    SponsorsModule,
    ResearchSitesModule,
    Cie10Module,
    HeroSlidesModule,
    SuccessStoriesModule,
    EmailsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting global
    },
  ],
})
export class AppModule {}