import { HttpInterceptorFn } from '@angular/common/http';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decodeURIComponent(escape(decoded)));
    return typeof parsed.exp !== 'number' || parsed.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('tierra_querida_token');
  const requiresExpiredToken = req.url.endsWith('/refresh');

  if (!token) {
    return next(req);
  }

  if (requiresExpiredToken) {
    return next(req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }));
  }

  if (isTokenExpired(token)) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
