import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { RolService } from '../services/rol.service';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const rolService = inject(RolService);
  const allowedRoles = route.data['roles'] as string[] | undefined;
  const user = auth.currentUser();

  if (!allowedRoles?.length) {
    return true;
  }

  if (user) {
    return rolService.list().pipe(
      map((roles) => {
        const currentRole = roles.find((rol) => Number(rol.id_rol) === Number(user.id_rol));
        return currentRole && allowedRoles.includes(currentRole.nombre_rol)
          ? true
          : router.createUrlTree(['/dashboard']);
      }),
    );
  }

  return auth.perfil().pipe(
    switchMap((usuario) =>
      rolService.list().pipe(
        map((roles) => {
          const currentRole = roles.find((rol) => Number(rol.id_rol) === Number(usuario.id_rol));
          return currentRole && allowedRoles.includes(currentRole.nombre_rol)
            ? true
            : router.createUrlTree(['/dashboard']);
        }),
      ),
    ),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
