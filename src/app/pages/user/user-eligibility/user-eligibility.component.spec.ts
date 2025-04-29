import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEligibilityComponent } from './user-eligibility.component';

describe('UserEligibilityComponent', () => {
  let component: UserEligibilityComponent;
  let fixture: ComponentFixture<UserEligibilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserEligibilityComponent]
    });
    fixture = TestBed.createComponent(UserEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
