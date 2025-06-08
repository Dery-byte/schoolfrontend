import { TestBed } from '@angular/core/testing';

import { ManaulServiceService } from './manaul-service.service';

describe('ManaulServiceService', () => {
  let service: ManaulServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManaulServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
