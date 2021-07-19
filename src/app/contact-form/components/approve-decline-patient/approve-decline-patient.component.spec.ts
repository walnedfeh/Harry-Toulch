import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveDeclinePatientComponent } from './approve-decline-patient.component';

describe('ApproveDeclinePatientComponent', () => {
  let component: ApproveDeclinePatientComponent;
  let fixture: ComponentFixture<ApproveDeclinePatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveDeclinePatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveDeclinePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
