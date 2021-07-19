import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactFormBaseContentComponent } from './components/contact-form-base-content/contact-form-base-content.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'contact-form/patient-form', pathMatch: 'full' },
  {
    path: 'contact-form', component: ContactFormBaseContentComponent, children: [
      { path: 'patient-form', component: PatientFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CantactFormRoutingModule { }
