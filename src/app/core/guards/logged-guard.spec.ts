import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { loggedGuard } from './logged-guard';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { Const } from 'src/app/const/const';

describe('loggedGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;

  const executeGuard = (route: any, state: any) =>
    TestBed.runInInjectionContext(() => loggedGuard(route, state));

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LocalStorageService, useValue: localStorageSpy }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is NOT logged in', () => {
    localStorageSpy.get.and.returnValue(null); // No UID
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home if user IS logged in', () => {
    localStorageSpy.get.withArgs(Const.USER_UID).and.returnValue('some-uid');
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
