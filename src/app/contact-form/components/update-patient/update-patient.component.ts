import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { Patientdata } from '../../models/patientdata';
import { PatientService } from '../../services/patient.service';
import { TranslateService } from '@ngx-translate/core';
import { EmailAsyncValidator } from '../../custom-validators/email-async-validator';
import { map, tap } from 'rxjs/operators';
import { InitializePatientData } from '../../custom-validators/inittialize-patient-data';
import { LoginBody } from '../../models/login-body';
import { environment } from 'src/environments/environment';
import { Updatepatientrequest } from '../../models/update-patient-request';
import { AddPatientRequest } from '../../models/add-patient-request';
@Component({
  selector: 'app-update-patient',
  templateUrl: './update-patient.component.html',
  styleUrls: ['./update-patient.component.css'],
  providers: [MessageService]
})
export class UpdatePatientComponent implements OnInit {
  UpdatePatientForm!: FormGroup;
  LoginForm!: FormGroup;
  UpdatePatientFormSubmitted: boolean = false;
  PatientObservable!: Observable<Patientdata>;
  SecurityParam: string = '';
  UpdatePatientSpinnerEnabled: boolean = false;
  NotAuthorozedDialogHeader: string = '';
  NotAuthorozedDialogEnabled: boolean = false;
  ErrorMessage: string = '';
  AllFieldsExists: boolean = false;
  LoginErrorEnabled: boolean = false;
  LoginSpinnerEnabled: boolean = false;
  LoginFormEnabled: boolean = false;
  LoginFormSubmitted: boolean = false;
  PatientData: Patientdata = new Patientdata();
  zCode: string = '';
  passwordHide = true;
  constructor(private fb: FormBuilder,
    private pserv: PatientService,
    private async: EmailAsyncValidator,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private messageService: MessageService
  ) { }


  ngOnInit(): void {
    let today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    let tokenDate: Date = new Date(Date.parse(localStorage.getItem('TokenDate') || ''));
    tokenDate.setHours(0, 0, 0, 0);
    if (today.toDateString() != tokenDate.toDateString()) {
      localStorage.removeItem('Token');
    }

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
        //   p.insuranceCompany = params.get('insuranceCompany') || 'n/a';
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
    this.UpdatePatientForm = this.fb.group({
      zCode: new FormControl('', {
        updateOn: 'blur', validators: [Validators.required, Validators.pattern('Z|z[0-9]+$')],
        asyncValidators: [this.async.zCodeAsyncValidator.bind(this)]
      }),
    });
    this.LoginForm = this.fb.group({
      userName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });


    this.PatientObservable.subscribe(x => {

      let Old: any = <any>JSON.parse(JSON.stringify(localStorage.getItem('updatepatient') || ''));

      let New: any = <any>JSON.stringify(InitializePatientData(x));
      let cantApprove: boolean = Old == New;




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
          x.preferedContact != 'n/a' &&
          this.SecurityParam == '4545') {
          if (cantApprove == false) {
            this.AllFieldsExists = true;
            this.PatientData = x;
          } else {
            this.NotAuthorozedDialogHeader = `Error`;
            this.ErrorMessage = `This patient already updated.`;
            this.NotAuthorozedDialogEnabled = true;
          }

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
    this.translateService.addLangs(['en', 'fr']);
    this.translateService.use('en');
  }

  onUpdatePatientFormSubmit(e: any) {
    this.UpdatePatientFormSubmitted = true;
    if (this.UpdatePatientForm.invalid) {
      return;
    }

    this.zCode = this.UpdatePatientForm.get('zCode')?.value.split('Z')[1];
    let Token: string = <string>localStorage.getItem('Token');
    if (Token) {
      this.UpdatePatientSpinnerEnabled = true;
      let patient: Updatepatientrequest = <Updatepatientrequest>InitializePatientData(this.PatientData);
      let storgePatient: AddPatientRequest = InitializePatientData(this.PatientData);
      patient.id = this.zCode;
      let newPatientZcode: string = '';
      this.pserv.updatePatient(patient, <string>localStorage.getItem('Token')).pipe(tap({
        next: (res: any) => {
          newPatientZcode = 'z' + res?.id;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'ُError', detail: 'Error while updating patient' });
          this.UpdatePatientSpinnerEnabled = false;
        },
        complete: () => {
          this.UpdatePatientSpinnerEnabled = false;
          this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Patient data has been updated' });

          this.NotAuthorozedDialogHeader = ``;
          this.ErrorMessage = `Patient data has been updated (` + newPatientZcode + `).`;
          this.NotAuthorozedDialogEnabled = true;
          localStorage.removeItem('updatepatient');
          localStorage.setItem('updatepatient', JSON.stringify(storgePatient));
        }
      })
      ).subscribe(data => { });
    } else {
      this.DisplayLoginForm();
    }
  }


  get f() {
    return this.LoginForm.controls;
  }

  get fu() {
    return this.UpdatePatientForm.controls;
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
        next: (x) => {
          localStorage.removeItem('Token');
          localStorage.removeItem('TokenDate');
          localStorage.setItem('Token', x);
          let today: Date = new Date();
          localStorage.setItem('TokenDate', today.toDateString());
        },
        error: (y) => {
          this.LoginErrorEnabled = true;
          this.LoginSpinnerEnabled = false;
        },
        complete: () => {
          let patient: Updatepatientrequest = <Updatepatientrequest>InitializePatientData(this.PatientData);
          let storgePatient: AddPatientRequest = InitializePatientData(this.PatientData);
          patient.id = this.zCode;
          let newPatientZcode: string = '';
          this.pserv.updatePatient(patient, <string>localStorage.getItem('Token')).pipe(tap({
            next: (res: any) => {
              newPatientZcode = 'z' + res?.id;
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'ُError', detail: 'Error while updating patient' });
              this.LoginSpinnerEnabled = false;
            },
            complete: () => {
              this.LoginSpinnerEnabled = false;
              this.messageService.add({ severity: 'info', summary: 'Approved', detail: 'Patient data has been updated' });
              this.NotAuthorozedDialogHeader = ``;
              this.ErrorMessage = `Patient data has been updated (` + newPatientZcode + `).`;
              this.NotAuthorozedDialogEnabled = true;
              localStorage.removeItem('updatepatient');
              localStorage.setItem('updatepatient', JSON.stringify(storgePatient));
            }
          })
          ).subscribe(data => { });
        }
      })).subscribe(data => { });

  }

  ResetPatientForm() {
    this.LoginForm.reset();
  }

}
