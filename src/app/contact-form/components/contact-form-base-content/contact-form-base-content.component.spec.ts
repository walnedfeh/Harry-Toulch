import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFormBaseContentComponent } from './contact-form-base-content.component';

describe('ContactFormBaseContentComponent', () => {
  let component: ContactFormBaseContentComponent;
  let fixture: ComponentFixture<ContactFormBaseContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactFormBaseContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactFormBaseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
