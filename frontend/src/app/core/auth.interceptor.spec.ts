import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

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
});
