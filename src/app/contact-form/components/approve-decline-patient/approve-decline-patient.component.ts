import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
        p.City = params.get('City') || 'n/a';
        p.Province = params.get('Province') || 'n/a';
        p.PostalCode = params.get('PostalCode') || 'n/a';
        p.Country = params.get('Country') || 'n/a';
        p.BuildingNum = params.get('BuildingNum') || 'n/a';
        p.SubBuilding = params.get('SubBuilding') || 'n/a';
        return p;
      })
    );

    this.LoginForm = this.fb.group({
      userName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });

    this.PatientObservable.subscribe(x => {
      if (this.SecurityParam != 'n/a') {
        if (x.firstName != 'n/a' && x.lastName != 'n/a' && x.birthDate != 'n/a' &&
          x.email != 'n/a' && x.cell != 'n/a'
          && x.fullAddress != 'n/a' && x.streetName != 'n/a' && x.City != 'n/a' && x.Province != 'n/a' &&
          x.PostalCode != 'n/a' && x.Country != 'n/a' && x.BuildingNum != 'n/a' && x.SubBuilding != 'n/a' && this.SecurityParam != 'n/a') {
          this.AllFieldsExists = true;
          this.PatientData = x;
        } else {
          this.ErrorMessage = `Invalid patient data.`;
          this.NotAuthorozedDialogEnabled = true;
        }
      } else {
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
    loginBody.accountsId = 2040;
    loginBody.storeId = 1;
    this.pserv.harryToulchLogin(this.LoginForm.get('userName')?.value,
      this.LoginForm.get('password')?.value, loginBody).subscribe(x => {
        if (x) {
          localStorage.setItem('Token', x);
          if (this.AllFieldsExists && this.SecurityParam == '4545') {
            //this.pserv.createNewPatient()
          }
          this.LoginSpinnerEnabled = false;
        }
      }, error => {
        this.LoginErrorEnabled = true;
        this.LoginSpinnerEnabled = false;
      });
  }

  DisplayLoginForm() {
    if (this.AllFieldsExists && this.SecurityParam != '4545') {
      this.LoginFormEnabled = true;
    }
    else {
      this.ErrorMessage = `You're not autorized to make this action.`;
      this.NotAuthorozedDialogEnabled = true;
    }
  }

  ApprovePatient() {
    let Token: string = <string>localStorage.getItem('Token');
    if (Token) {
      //approve patient
      alert('patient approved')
    } else {
      this.DisplayLoginForm();
    }
  }

}


