import { AfterViewChecked, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { cellPhoneNumberValidator, homePhoneNumberValidator } from '../../custom-validators/cell-phone-validator';
import { PrepareMatchedZcodeFieldsApi, ReverseZcodesMatchingFields } from '../../custom-validators/zcode-matches-reverse';
import { CanadaPostSuggestItem } from '../../models/canada-post-suggest-item';
import { CanadaPostSuggestItemDetails } from '../../models/canada-post-suggest-item-details';
import { Patientdata } from '../../models/patientdata';
import { ZCodeMatch } from '../../models/z-code-match';
import { PatientService } from '../../services/patient.service';
import { ThirdPartyServicesService } from '../../services/third-party-services-service';
import { MyTel } from '../tel-input/tel-input.component';
import { TranslateService } from '@ngx-translate/core';
import { EmailAsyncValidator } from '../../custom-validators/email-async-validator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
  providers: [MessageService]
})
export class PatientFormComponent implements OnInit, OnDestroy {
  //patient form attributes
  PatientForm!: FormGroup;
  PatientFormSubmitted: boolean = false;
  PatientFormValue: any;
  canadaAdressCompleteControl = new FormControl();
  options = [];
  filteredOptions: Observable<CanadaPostSuggestItem[]> = new Observable<CanadaPostSuggestItem[]>();
  AddressFieldsEnabled: boolean = false;
  patientFormSpinnerEnabled: boolean = false;
  CanadaPostInputEnabled: boolean = true;
  InitialMobileNumbersValue: MyTel = new MyTel('', '', '');
  manualAddressToggle: boolean = true;
  //language configuration
  LanguageValue: string = 'en';
  LanguageSelectionDialog: boolean = true;
  supportLanguages = ['en', 'fr'];
  cellTouched: boolean = false;
  paddingValue: string = '';
  SubmitButtonDisabled: boolean = false;
  ThankYouDialogVisible: boolean = false;
  EmailValidationIconEnabled: boolean = false;
  constructor(private fb: FormBuilder,
    private serv: ThirdPartyServicesService,
    private dialog: MatDialog,
    private pserv: PatientService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private emailValidator: EmailAsyncValidator,
    private router: Router) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang('en');
    const browserlang = this.translateService.getBrowserLang();
    if (this.supportLanguages.includes(browserlang)) {
      this.translateService.use(browserlang);
      this.LanguageValue = browserlang;
    }
    this.paddingValue = window.innerWidth > 500 ? 'p-2' : '';
  }
  ngOnDestroy(): void {

  }
  //language events

  MatSelectLanguage() {
    this.translateService.use(this.LanguageValue);
  }

  DialogSelectLanguage(_lang: string) {
    this.LanguageValue = _lang;
    this.translateService.use(this.LanguageValue);
    this.LanguageSelectionDialog = false;
  }


  get f() {
    return this.PatientForm.controls;
  }



  ngOnInit(): void {

    this.canadaAdressCompleteControl.setValidators(Validators.required);
    this.PatientForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthDate: ['', Validators.compose([Validators.required])],
      email: new FormControl('', {
        updateOn: 'blur', validators: [Validators.required, Validators.email], asyncValidators: this.emailValidator.validate.bind(this)
      }),
      cell: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]{3}[0-9]{3}[0-9]{4}')])],
      phone: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]{3}[0-9]{3}[0-9]{4}')])],
      streetName: ['', Validators.required],
      healthCard: new FormControl('', { updateOn: 'blur', validators: [Validators.minLength(12), Validators.maxLength(12), Validators.pattern('[a-z]{4}|[A-Z]{4}[0-9]{8}')] }),
      //insuranceCompany: ['',],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      buildingNum: ['', Validators.required],
      subBuilding: ['',],
      manualAddressSelect: [false,],
      manualAddressText: ['', Validators.required],
      preferedContact: ['', Validators.required],
      firstVisitOption: [false,],
      disclaimer: [false, Validators.requiredTrue]
    });

    //  this.PatientForm.get('email')?.setErrors(null);

    this.filteredOptions = this.canadaAdressCompleteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => {
        return this.filter(val || '')
      })
    );

    // this.filteredOptions.subscribe(t => {


    // });
    this.PatientForm.get('manualAddressSelect')?.valueChanges.subscribe((t: boolean) => {
      this.PatientForm.controls.city.setValue('');
      this.PatientForm.controls.province.setValue('');
      this.PatientForm.controls.postalCode.setValue('');
      this.PatientForm.controls.country.setValue('');
      this.PatientForm.controls.buildingNum.setValue('');
      this.PatientForm.controls.manualAddressText.setValue('');
      this.PatientForm.controls.subBuilding.setValue('');
      this.PatientForm.controls.streetName.setValue('');
      this.canadaAdressCompleteControl.setValue('');
      if (t == true) {
        this.CanadaPostInputEnabled = false;
        this.AddressFieldsEnabled = true;
      } else {
        this.CanadaPostInputEnabled = true;
        this.AddressFieldsEnabled = false;
      }
    });

    // console.log(this.f.email.errors);


  }

  // EmailOnBlur() {
  //   const control = this.PatientForm.get('email');
  //   if (control?.value != '') {
  //     control?.setValidators(Validators.email);
  //     control?.setAsyncValidators(this.emailValidator.validate.bind(this));
  //     this.EmailValidationIconEnabled = true;
  //     console.log(1);

  //   } else {
  //     control?.clearValidators();
  //     control?.clearAsyncValidators();
  //     control?.setErrors(null);
  //     this.EmailValidationIconEnabled = false;
  //     console.log(2);

  //   }

  // }

  // PhoneOnBlur() {
  //   const control = this.PatientForm.get('phone');
  //   if (control?.value != '') {
  //     control?.setValidators(Validators.minLength(10));
  //     control?.setValidators(Validators.maxLength(10));
  //     control?.setValidators(Validators.pattern('[0-9]{3}[0-9]{3}[0-9]{4}'));
  //   } else {
  //     control?.clearValidators();
  //     control?.setErrors(null);
  //   }

  // }

  RedirectAfterSubmit() {
    window.location.href = '/';
  }

  onPatientFormSubmit = (e: any) => {
    //console.log(this.f.email.errors);
    this.PatientFormSubmitted = true;
    this.cellTouched = true;

    if (this.PatientForm.get('manualAddressSelect')?.value == true) {
      this.canadaAdressCompleteControl.setValue(this.PatientForm.get('manualAddressText')?.value);
    } else {
      this.PatientForm.controls.manualAddressText.setValue(this.canadaAdressCompleteControl.value);
    }

    if (this.PatientForm.invalid) {
      e.preventDefault();
      return;
    }

    this.patientFormSpinnerEnabled = true;
    this.SubmitButtonDisabled = true;
    let p: Patientdata = new Patientdata();
    p = Object.assign(p, this.PatientForm.value);
    //  console.log(p);

    // p.cell = '(' + this.PatientForm.get('cell')?.value.area + ')' +
    //   ' ' + this.PatientForm.get('cell')?.value.exchange +
    //   '-' + this.PatientForm.get('cell')?.value.subscriber;

    // let phoneExists: boolean = this.PatientForm.get('phone')?.value?.area.length == 3 &&
    //   this.PatientForm.get('phone')?.value?.exchange.length == 3
    //   && this.PatientForm.get('phone')?.value?.subscriber.length == 4 && !this.f.phone.errors;

    // if (phoneExists) {
    //   p.phone = '(' + this.PatientForm.get('phone')?.value?.area + ')' +
    //     ' ' + this.PatientForm.get('phone')?.value?.exchange +
    //     '-' + this.PatientForm.get('phone')?.value?.subscriber;
    // }
    // else {
    //   p.phone = '';
    // }
    let phoneExists: boolean = this.PatientForm.get('phone')?.value != '';
    p.fullAddress = this.canadaAdressCompleteControl.value.Text;
    let MatchedzCodes: ZCodeMatch[] = [];
    // this.pserv.getPatientListByFirstLastNameZcodesMatch(p.firstName, p.lastName, 'First & Last Name').subscribe(u => {
    //   MatchedzCodes.push(u);
    this.pserv.getParamZcodesMatch('email', p.email, 'E-mail').subscribe(x => {
      MatchedzCodes.push(x);
      this.pserv.getParamZcodesMatch('mobile', p.cell, 'Cell').subscribe(y => {
        MatchedzCodes.push(y);
        if (phoneExists) {
          this.pserv.getParamZcodesMatch('home', p.phone, 'Home').subscribe(z => {
            MatchedzCodes.push(z);
            this.serv.VerifyEmailBool(p.email).subscribe(a => {
              p.isValidEmail = a;
              if (MatchedzCodes.length > 0) {
                p.zCodes = PrepareMatchedZcodeFieldsApi(ReverseZcodesMatchingFields(MatchedzCodes));
              }
              console.log(p);
              console.log('with phone');

              this.pserv.sendEmail(p).subscribe(b => {
                this.messageService.add({ severity: 'info', summary: 'Done', detail: 'You info has been sent' });
                this.patientFormSpinnerEnabled = false;
                this.SubmitButtonDisabled = false;
                this.ThankYouDialogVisible = true;
                setTimeout(() => {
                  this.RedirectAfterSubmit();
                }, 5000);
              }, error => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'An Error Occured ' });
                this.patientFormSpinnerEnabled = false;
              });
            });
          });
        }
        else {
          this.serv.VerifyEmailBool(p.email).subscribe(a => {
            p.isValidEmail = a;
            if (MatchedzCodes.length > 0) {
              p.zCodes = PrepareMatchedZcodeFieldsApi(ReverseZcodesMatchingFields(MatchedzCodes));
            }
            console.log(p);
            console.log('without phone');

            this.pserv.sendEmail(p).subscribe(b => {
              this.messageService.add({ severity: 'info', summary: 'Done', detail: 'You info has been sent' });
              this.patientFormSpinnerEnabled = false;
              this.SubmitButtonDisabled = false;
              this.ThankYouDialogVisible = true;
              setTimeout(() => {
                this.RedirectAfterSubmit();
              }, 5000);
            }, error => {
              this.patientFormSpinnerEnabled = false;
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'An Error Occured ' });
            });
          });
        }
      });
    });

  }


  ResetPatientForm = () => {
    this.PatientForm.reset();
  }

  //filter function will return an array depending on text condition 
  filter(val: string, LastId?: string): Observable<CanadaPostSuggestItem[]> {
    if (LastId != null) {
      return this.serv.getCanadaPostSuggestedItems(val, 'CAN', 'EN', LastId);
    }
    else {
      return this.serv.getCanadaPostSuggestedItems(val, 'CAN', 'EN');
      //   return this.serv.getCanadaPostSuggestedItems(val, 'CAN', 'EN')
      //     .pipe(
      //       map(response => response.filter(option => {
      //         return option.Text.toLowerCase().indexOf(val.toString().toLowerCase()) === 0
      //       }))
      //     );
    }
  }

  GetItemDetails(value: CanadaPostSuggestItem) {
    if (value.Next != "") {
      if (value.Next == 'Find') {
        this.serv.getCanadaPostSuggestedItems(value.Text, 'CAN', 'EN', value.Id).subscribe(x => {

          const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
            width: '500px',
            data: { SelectedOption: value, SubOptions: x }
          });
          dialogRef.afterClosed().subscribe(result => {
            this.serv.getCanadaPostItemDetails(result[0].Id).subscribe(res => {
              let result: CanadaPostSuggestItemDetails = res[0];
              this.AddressFieldsEnabled = true;
              this.PatientForm.controls.city.setValue(result.City);
              this.PatientForm.controls.province.setValue(result.Province);
              this.PatientForm.controls.postalCode.setValue(result.PostalCode);
              this.PatientForm.controls.country.setValue(result.CountryName);
              this.PatientForm.controls.buildingNum.setValue(result.BuildingNumber);
              this.PatientForm.controls.subBuilding.setValue(result.SubBuilding);
              this.PatientForm.controls.streetName.setValue(result.Street);
              this.manualAddressToggle = false;
            });
          });
        });
      }
      else {
        this.serv.getCanadaPostItemDetails(value.Id).subscribe(res => {
          let result: CanadaPostSuggestItemDetails = res[0];
          this.AddressFieldsEnabled = true;
          this.PatientForm.controls.city.setValue(result.City);
          this.PatientForm.controls.province.setValue(result.Province);
          this.PatientForm.controls.postalCode.setValue(result.PostalCode);
          this.PatientForm.controls.country.setValue(result.CountryName);
          this.PatientForm.controls.buildingNum.setValue(result.BuildingNumber);
          this.PatientForm.controls.subBuilding.setValue(result.SubBuilding);
          this.PatientForm.controls.streetName.setValue(result.Street);
          this.manualAddressToggle = false;
        });

      }
    }
  }

  displayFn(item: CanadaPostSuggestItem): string {
    return item && item.Text ? item.Text : '';
  }

}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}

export interface DialogData {
  SelectedOption: CanadaPostSuggestItem;
  SubOptions: CanadaPostSuggestItem[];
  DialogSelectedOption: CanadaPostSuggestItem;
}
