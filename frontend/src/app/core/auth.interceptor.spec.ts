import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { Router, provideRouter } from '@angular/router';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem('plateforme-missions-session', JSON.stringify({
      token: 'demo-token',
      utilisateur: {
        id: 1,
        nomComplet: 'Admin Demo',
        email: 'admin@demo.invalid',
        role: 'ADMIN'
      }
    }));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should append the bearer token', () => {
    http.get('/demo').subscribe();

    const request = httpTesting.expectOne('/demo');
    expect(request.request.headers.get('Authorization')).toBe('Bearer demo-token');
    request.flush({});
  });

  it('should clear the session and redirect on 401', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    http.get('/protected').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('/protected');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('plateforme-missions-session')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
