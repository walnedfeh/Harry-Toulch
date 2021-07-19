import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CantactFormRoutingModule } from './contact-form-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ApproveDeclinePatientComponent } from './components/approve-decline-patient/approve-decline-patient.component';
import { ContactFormBaseContentComponent } from './components/contact-form-base-content/contact-form-base-content.component';
import { DialogOverviewExampleDialog, PatientFormComponent } from './components/patient-form/patient-form.component';
import { PatientsInterceptionsInterceptor } from './interceptors/patients-interceptions.interceptor';
import { TelInputComponent } from './components/tel-input/tel-input.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    ApproveDeclinePatientComponent,
    ContactFormBaseContentComponent,
    DialogOverviewExampleDialog,
    PatientFormComponent,
    TelInputComponent

  ],
  imports: [
    CommonModule,
    CantactFormRoutingModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule, MatAutocompleteModule,
    HttpClientModule, MatBottomSheetModule, MatListModule,
    MatDialogModule, FormsModule, MatProgressBarModule, MatProgressSpinnerModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: PatientsInterceptionsInterceptor,
    multi: true
  }]
})
export class ContactFormModule { }
