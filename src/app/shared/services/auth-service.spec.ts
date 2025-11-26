import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';
import { ToastService } from './toast-service';
import { UserService } from './user-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['show']);
    const userSpy = jasmine.createSpyObj('UserService', ['findIdByUid']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ToastService, useValue: toastSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
