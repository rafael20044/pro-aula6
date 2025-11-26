import { TestBed } from '@angular/core/testing';
import { LoggedGuard } from './logged-guard';
import { AuthStateService } from '../auth/auth-state';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth-service';

describe('LoggedGuard', () => {
  let guard: LoggedGuard;

  beforeEach(() => {
    const authStateSpy = jasmine.createSpyObj('AuthStateService', ['getSession']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authSpy = jasmine.createSpyObj('AuthService', ['ensureReady', 'getSession']);

    TestBed.configureTestingModule({
      providers: [
        LoggedGuard,
        { provide: AuthStateService, useValue: authStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });
    guard = TestBed.inject(LoggedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
