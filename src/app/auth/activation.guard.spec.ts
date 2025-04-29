import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { activationGuard } from './activation.guard';

describe('activationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => activationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
