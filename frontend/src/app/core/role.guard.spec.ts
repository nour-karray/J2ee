import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([]), provideHttpClient()]
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should allow access when the role is authorized', () => {
    sessionStorage.setItem('plateforme-missions-session', JSON.stringify({
      token: 'token',
      utilisateur: {
        id: 2,
        nomComplet: 'Admin Demo',
        email: 'admin@demo.invalid',
        role: 'ADMIN'
      }
    }));

    const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])({} as never, {} as never));

    expect(result).toBeTrue();
  });

  it('should redirect when the role is not authorized', () => {
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])({} as never, {} as never));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
