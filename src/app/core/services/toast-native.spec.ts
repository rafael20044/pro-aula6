import { TestBed } from '@angular/core/testing';

import { ToastNative } from './toast-native';

describe('ToastNative', () => {
  let service: ToastNative;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastNative);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
