import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCheckResultsComponent } from './user-check-results.component';

describe('UserCheckResultsComponent', () => {
  let component: UserCheckResultsComponent;
  let fixture: ComponentFixture<UserCheckResultsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCheckResultsComponent]
    });
    fixture = TestBed.createComponent(UserCheckResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
