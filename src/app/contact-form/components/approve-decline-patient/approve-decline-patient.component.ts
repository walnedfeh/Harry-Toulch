import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { InitializePatientData } from '../../custom-validators/inittialize-patient-data';
import { AddPatientRequest } from '../../models/add-patient-request';
import { LoginBody } from '../../models/login-body';
import { Patientdata } from '../../models/patientdata';
import { PatientService } from '../../services/patient.service';
import { DialogOverviewExampleDialog } from '../patient-form/patient-form.component';

@Component({
  selector: 'app-approve-decline-patient',
  templateUrl: './approve-decline-patient.component.html',
  styleUrls: ['./approve-decline-patient.component.css'],
  providers: [MessageService]
})
export class ApproveDeclinePatientComponent implements OnInit, OnDestroy {
  PatientObservable!: Observable<Patientdata>;
  SecurityParam: string = '';
  LoginFormEnabled: boolean = false;
  LoginForm!: FormGroup;
  passwordHide = true;
  LoginFormSubmitted: boolean = false;
  PushPatientSpinnerEnabled: boolean = false;
  NotAuthorozedDialogEnabled: boolean = false;
  ErrorMessage: string = '';
  AllFieldsExists: boolean = false;
  LoginErrorEnabled: boolean = false;
  LoginSpinnerEnabled: boolean = false;
  PatientData: Patientdata = new Patientdata();
  NotAuthorozedDialogHeader: string = '';
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private pserv: PatientService,
    private messageService: MessageService) { }

  ngOnDestroy(): void {
    localStorage.clear();
  }

  ngOnInit(): void {

    this.PatientObservable = this.route.queryParamMap.pipe(
      map((params) => {
        let p: Patientdata = new Patientdata();
        this.SecurityParam = params.get('htpr') || 'n/a';
        p.firstName = params.get('firstName') || 'n/a';
        p.lastName = params.get('lastName') || 'n/a';
        p.birthDate = params.get('birthDate') || 'n/a';
        p.email = params.get('email') || 'n/a';
        p.cell = params.get('cell') || 'n/a';
        p.phone = params.get('phone') || 'n/a';
        p.fullAddress = params.get('fullAddress') || 'n/a';
        p.streetName = params.get('streetName') || 'n/a';
        p.healthCard = params.get('healthCard') || 'n/a';
        p.insuranceCompany = params.get('insuranceCompany') || 'n/a';
        p.city = params.get('city') || 'n/a';
        p.province = params.get('province') || 'n/a';
        p.postalCode = params.get('postalCode') || 'n/a';
        p.country = params.get('country') || 'n/a';
        p.buildingNum = params.get('buildingNum') || 'n/a';
        p.subBuilding = params.get('subBuilding') || 'n/a';
        p.preferedContact = params.get('preferedContact') || 'n/a';
        return p;
      })
    );

    this.LoginForm = this.fb.group({
      userName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });

    this.PatientObservable.subscribe(x => {
      console.log(x);

      if (this.SecurityParam == '4545') {
        if (x.firstName != 'n/a' &&
          x.lastName != 'n/a' &&
          x.birthDate != 'n/a' &&
          x.email != 'n/a' &&
          x.cell != 'n/a' &&
          x.fullAddress != 'n/a' &&
          x.streetName != 'n/a' &&
          x.city != 'n/a' &&
          x.province != 'n/a' &&
          x.preferedContact != 'n/a' &&
          x.postalCode != 'n/a' &&
          x.country != 'n/a' &&
          x.buildingNum != 'n/a' &&
          x.subBuilding != 'n/a' &&
          this.SecurityParam == '4545') {
          this.AllFieldsExists = true;
          this.PatientData = x;
        } else {
          this.NotAuthorozedDialogHeader = `Error`;
          this.ErrorMessage = `Invalid patient data.`;
          this.NotAuthorozedDialogEnabled = true;
        }
      } else {
        this.NotAuthorozedDialogHeader = `Error`;
        this.ErrorMessage = `You're not autorized to make this action.`;
        this.NotAuthorozedDialogEnabled = true;
      }
    });
  }


  get f() {
    return this.LoginForm.controls;
  }

  ResetPatientForm() {
    this.LoginForm.reset();
  }

  onLoginFormSubmitted(e: any) {
    this.LoginFormSubmitted = true;
    this.LoginErrorEnabled = false;
    this.LoginSpinnerEnabled = true;
    if (this.LoginForm.invalid) {
      e.preventDefault();
      return;
    }
    let loginBody: LoginBody = new LoginBody();
    loginBody.accountsId = environment.accountId;
    loginBody.storeId = environment.storeId;
    this.pserv.harryToulchLogin(this.LoginForm.get('userName')?.value,
      this.LoginForm.get('password')?.value, loginBody).pipe(tap({
        next: (x) => { localStorage.setItem('Token', x); },
        error: (y) => {
          this.LoginErrorEnabled = true;
          this.LoginSpinnerEnabled = false;
        },
        complete: () => {
          let patient: AddPatientRequest = InitializePatientData(this.PatientData);
          this.pserv.createNewPatient(patient, <string>localStorage.getItem('Token')).pipe(tap({
            next: () => { },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'ُError', detail: 'Error while approving patient' });
              this.LoginSpinnerEnabled = false;
            },
            complete: () => {
              this.LoginSpinnerEnabled = false;
              this.messageService.add({ severity: 'info', summary: 'Approved', detail: 'Patient data has been approved' });
              this.NotAuthorozedDialogHeader = ``;
              this.ErrorMessage = `Patient data has been approved.`;
              this.NotAuthorozedDialogEnabled = true;
            }
          })
          ).subscribe(data => { });
        }
      })).subscribe(data => { });

  }

  DisplayLoginForm() {
    if (this.AllFieldsExists && this.SecurityParam == '4545') {
      this.LoginFormEnabled = true;
    }
    else {
      this.NotAuthorozedDialogHeader = `Error`;
      this.ErrorMessage = `You're not autorized to make this action.`;
      this.NotAuthorozedDialogEnabled = true;
    }
  }

  ApprovePatient() {
    let Token: string = <string>localStorage.getItem('Token');
    if (Token) {
      this.PushPatientSpinnerEnabled = true;
      let patient: AddPatientRequest = InitializePatientData(this.PatientData);
      this.pserv.createNewPatient(patient, <string>localStorage.getItem('Token')).pipe(tap({
        next: () => { },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'ُError', detail: 'Error while approving patient' });
          this.PushPatientSpinnerEnabled = false;
        },
        complete: () => {
          this.PushPatientSpinnerEnabled = false;
          this.messageService.add({ severity: 'info', summary: 'Approved', detail: 'Patient data has been approved' });

          this.NotAuthorozedDialogHeader = ``;
          this.ErrorMessage = `Patient data has been approved.`;
          this.NotAuthorozedDialogEnabled = true;
        }
      })
      ).subscribe(data => { });
    } else {
      this.DisplayLoginForm();
    }
  }

}


