import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveDeclinePatientComponent } from './components/approve-decline-patient/approve-decline-patient.component';
import { ContactFormBaseContentComponent } from './components/contact-form-base-content/contact-form-base-content.component';
import { HttpErrorComponent } from './components/http-error/http-error.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'contact-form/patient-form', pathMatch: 'full' },
  {
    path: 'contact-form', component: ContactFormBaseContentComponent, children: [
      { path: 'patient-form', component: PatientFormComponent },
      { path: 'approve-patient', component: ApproveDeclinePatientComponent }
    ]
  },
  { path: 'error', component: HttpErrorComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CantactFormRoutingModule { }
