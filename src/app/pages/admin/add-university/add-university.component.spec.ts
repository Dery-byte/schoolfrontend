import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUniversityComponent } from './add-university.component';

describe('AddUniversityComponent', () => {
  let component: AddUniversityComponent;
  let fixture: ComponentFixture<AddUniversityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddUniversityComponent]
    });
    fixture = TestBed.createComponent(AddUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
