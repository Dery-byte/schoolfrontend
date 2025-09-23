import { TestBed } from '@angular/core/testing';

import { AuthOauthService } from './auth-oauth.service';

describe('AuthOauthService', () => {
  let service: AuthOauthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthOauthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
