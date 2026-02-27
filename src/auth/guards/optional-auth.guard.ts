/**
 * Guard de autenticación OPCIONAL
 * 
 * Extrae el usuario del JWT si el token está presente y es válido,
 * pero NO rechaza la petición si no hay token o es inválido.
 * 
 * Útil para endpoints que son públicos pero que necesitan identificar
 * al usuario si está autenticado (ej: POST /patient-intakes donde
 * una institución autenticada crea un paciente y necesitamos saber cuál es).
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Si hay error o no hay usuario, simplemente retornar null
    // en vez de lanzar una excepción 401
    return user || null;
  }
}
