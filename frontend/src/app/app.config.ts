import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  LucideArrowLeftRight,
  LucideArrowRight,
  LucideBoxes,
  LucideChevronLeft,
  LucideClipboardList,
  LucideLayoutDashboard,
  LucideLogOut,
  LucidePackage,
  LucideRefreshCw,
  LucideSearch,
  LucideTags,
  LucideTriangleAlert,
  LucideTruck,
  LucideUsers,
  provideLucideIcons,
} from '@lucide/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideLucideIcons(
      LucideLayoutDashboard,
      LucideUsers,
      LucideTruck,
      LucidePackage,
      LucideBoxes,
      LucideArrowLeftRight,
      LucideTriangleAlert,
      LucideTags,
      LucideClipboardList,
      LucideArrowRight,
      LucideChevronLeft,
      LucideRefreshCw,
      LucideLogOut,
      LucideSearch,
    ),
  ],
};
