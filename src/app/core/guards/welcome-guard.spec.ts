import { TestBed } from '@angular/core/testing';
import { WelcomeGuard } from './welcome-guard';
import { AuthStateService } from '../auth/auth-state';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';

describe('WelcomeGuard', () => {
  let guard: WelcomeGuard;

  beforeEach(() => {
    const authStateSpy = jasmine.createSpyObj('AuthStateService', ['getSession']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const localSpy = jasmine.createSpyObj('LocalStorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        WelcomeGuard,
        { provide: AuthStateService, useValue: authStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LocalStorageService, useValue: localSpy }
      ]
    });
    guard = TestBed.inject(WelcomeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
