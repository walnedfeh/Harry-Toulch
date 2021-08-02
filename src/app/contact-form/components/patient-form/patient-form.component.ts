import { AfterViewChecked, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { cellPhoneNumberValidator } from '../../custom-validators/cell-phone-validator';
import { PrepareMatchedZcodeFieldsApi, ReverseZcodesMatchingFields } from '../../custom-validators/zcode-matches-reverse';
import { CanadaPostSuggestItem } from '../../models/canada-post-suggest-item';
import { CanadaPostSuggestItemDetails } from '../../models/canada-post-suggest-item-details';
import { Patientdata } from '../../models/patientdata';
import { ZCodeMatch } from '../../models/z-code-match';
import { PatientService } from '../../services/patient.service';
import { ThirdPartyServicesService } from '../../services/third-party-services-service';
import { MyTel } from '../tel-input/tel-input.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
  providers: [MessageService]
})
export class PatientFormComponent implements OnInit {
  //patient form attributes
  PatientForm!: FormGroup
  PatientFormSubmitted: boolean = false;
  PatientFormValue: any;
  canadaAdressCompleteControl = new FormControl();
  options = [];
  filteredOptions: Observable<CanadaPostSuggestItem[]> = new Observable<CanadaPostSuggestItem[]>();
  AddressFieldsEnabled: boolean = false;
  patientFormSpinnerEnabled: boolean = false;
  CanadaPostInputEnabled: boolean = true;
  InitialMobileNumbersValue: MyTel = new MyTel('', '', '');

  //language configuration
  LanguageValue: string = 'en';
  LanguageSelectionDialog: boolean = true;
  supportLanguages = ['en', 'fr'];

  constructor(private fb: FormBuilder,
    private serv: ThirdPartyServicesService,
    private dialog: MatDialog,
    private pserv: PatientService,
    private messageService: MessageService,
    private translateService: TranslateService) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang('en');
    const browserlang = this.translateService.getBrowserLang();
    if (this.supportLanguages.includes(browserlang)) {
      this.translateService.use(browserlang);
      this.LanguageValue = browserlang;
    }
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
    // this.pserv.getPatientListByFirstLastName([{ paramName: 'firstName', paramValue: 'Carlo' },
    // { paramName: 'lastName', paramValue: 'Dummar' }]).pipe(tap({
    //   next: (x) => {
    //     console.log('tap success', x);
    //     //this.isLoading = false;
    //   },
    //   error: (err) => {
    //     console.log('tap error', err);
    //     //  this.isLoading = false;
    //   },
    //   complete: () => { this.messageService.add({ severity: 'info', summary: 'Valid', detail: ' is valid' }); }
    // })).subscribe(x => {
    //   console.log(x);
    // });

    this.canadaAdressCompleteControl.setValidators(Validators.required);
    this.PatientForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthDate: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      cell: new FormControl(this.InitialMobileNumbersValue, cellPhoneNumberValidator()),
      phone: new FormControl(this.InitialMobileNumbersValue,),
      streetName: ['', Validators.required],
      healthCard: ['',],
      insuranceCompany: ['',],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      buildingNum: ['', Validators.required],
      subBuilding: ['',],
      manualAddressSelect: [false,],
      manualAddressText: ['', Validators.required]
    });

    this.filteredOptions = this.canadaAdressCompleteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => {
        return this.filter(val || '')
      })
    );

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
  }

  onPatientFormSubmit = (e: any) => {
    this.PatientFormSubmitted = true;
    if (this.PatientForm.get('manualAddressSelect')?.value == true) {
      this.canadaAdressCompleteControl.setValue(this.PatientForm.get('manualAddressText')?.value);
    } else {
      this.PatientForm.controls.manualAddressText.setValue(this.canadaAdressCompleteControl.value);
    }
    console.log(this.PatientForm.controls);

    if (this.PatientForm.invalid) {
      e.preventDefault();
      return;
    }

    this.patientFormSpinnerEnabled = true;
    let p: Patientdata = new Patientdata();
    p = Object.assign(p, this.PatientForm.value);
    p.cell = '(' + this.PatientForm.get('cell')?.value.area + ')' +
      ' ' + this.PatientForm.get('cell')?.value.exchange +
      '-' + this.PatientForm.get('cell')?.value.subscriber;

    let phoneExists: boolean = this.PatientForm.get('phone')?.value.area &&
      this.PatientForm.get('phone')?.value.exchange
      && this.PatientForm.get('phone')?.value.subscriber;

    if (phoneExists) {
      p.phone = '(' + this.PatientForm.get('phone')?.value.area + ')' +
        ' ' + this.PatientForm.get('phone')?.value.exchange +
        '-' + this.PatientForm.get('phone')?.value.subscriber;
    }
    p.fullAddress = this.canadaAdressCompleteControl.value.Text;
    let MatchedzCodes: ZCodeMatch[] = [];
    this.pserv.getParamZcodesMatch('email', p.email, 'E-mail').subscribe(x => {
      MatchedzCodes.push(x);
      this.pserv.getParamZcodesMatch('mobile', p.cell, 'Cell').subscribe(y => {
        MatchedzCodes.push(y);
        if (phoneExists) {
          this.pserv.getParamZcodesMatch('home', p.phone, 'Home').subscribe(z => {
            MatchedzCodes.push(z);
            this.serv.VerifyEmailBool(p.email).subscribe(a => {
              p.isValidEmail = a;
              if (a) {
                this.messageService.add({ severity: 'success', summary: 'Valid', detail: p.email + ' is valid' });
              } else {
                this.messageService.add({ severity: 'error', summary: 'Invalid', detail: p.email + ' is invalid' });
              }

              if (MatchedzCodes.length > 0) {
                p.zCodes = PrepareMatchedZcodeFieldsApi(ReverseZcodesMatchingFields(MatchedzCodes));
              }
              console.log(p);

              this.pserv.sendEmail(p).subscribe(b => {
                console.log(b);
                this.patientFormSpinnerEnabled = false;
              }, error => {
                this.patientFormSpinnerEnabled = false;
              });
            });
          });
        }
        else {
          this.serv.VerifyEmailBool(p.email).subscribe(a => {
            p.isValidEmail = a;
            if (a) {
              this.messageService.add({ severity: 'success', summary: 'Valid', detail: p.email + ' is valid' });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Invalid', detail: p.email + ' is invalid' });
            }
            console.log(p);
            if (MatchedzCodes.length > 0) {
              p.zCodes = PrepareMatchedZcodeFieldsApi(ReverseZcodesMatchingFields(MatchedzCodes));
            }
            console.log(p);
            this.pserv.sendEmail(p).subscribe(b => {
              console.log(b);
              this.patientFormSpinnerEnabled = false;
            }, error => {
              this.patientFormSpinnerEnabled = false;
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
      return this.serv.getCanadaPostSuggestedItems(val, 'CAN', 'EN', LastId)
        .pipe(
          map(response => response.filter(option => {
            return option.Text.toLowerCase().indexOf(val.toString().toLowerCase()) === 0
          }))
        );
    }
    else {
      return this.serv.getCanadaPostSuggestedItems(val, 'CAN', 'EN')
        .pipe(
          map(response => response.filter(option => {
            return option.Text.toLowerCase().indexOf(val.toString().toLowerCase()) === 0
          }))
        );
    }
  }

  GetItemDetails(value: CanadaPostSuggestItem) {
    console.log(value);
    if (value.Next == 'Find') {
      this.serv.getCanadaPostSuggestedItems(value.Text, 'CAN', 'EN', value.Id).subscribe(x => {
        console.log(x);

        const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
          width: '500px',
          data: { SelectedOption: value, SubOptions: x }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(result);

          console.log('The dialog was closed');
          this.serv.getCanadaPostItemDetails(result[0].Id).subscribe(res => {
            let result: CanadaPostSuggestItemDetails = res[0];
            this.AddressFieldsEnabled = true;
            this.PatientForm.controls.city.setValue(result.City);
            this.PatientForm.controls.crovince.setValue(result.Province);
            this.PatientForm.controls.postalCode.setValue(result.PostalCode);
            this.PatientForm.controls.country.setValue(result.CountryName);
            this.PatientForm.controls.buildingNum.setValue(result.BuildingNumber);
            this.PatientForm.controls.subBuilding.setValue(result.SubBuilding);
            this.PatientForm.controls.streetName.setValue(result.Street);
          });
        });
      });
    }
    else {
      this.serv.getCanadaPostItemDetails(value.Id).subscribe(res => {
        console.log(res);

        let result: CanadaPostSuggestItemDetails = res[0];
        this.AddressFieldsEnabled = true;
        this.PatientForm.controls.city.setValue(result.City);
        this.PatientForm.controls.province.setValue(result.Province);
        this.PatientForm.controls.postalCode.setValue(result.PostalCode);
        this.PatientForm.controls.country.setValue(result.CountryName);
        this.PatientForm.controls.buildingNum.setValue(result.BuildingNumber);
        this.PatientForm.controls.subBuilding.setValue(result.SubBuilding);
        this.PatientForm.controls.streetName.setValue(result.Street);
      });

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
    console.log(data.SubOptions);

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
