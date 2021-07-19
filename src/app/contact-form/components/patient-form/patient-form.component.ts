import { AfterViewChecked, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { CanadaPostSuggestItem } from '../../models/canada-post-suggest-item';
import { CanadaPostSuggestItemDetails } from '../../models/canada-post-suggest-item-details';
import { Patientdata } from '../../models/patientdata';
import { PatientService } from '../../services/patient.service';
import { ThirdPartyServicesService } from '../../services/third-party-services-service';
import { MyTel } from '../tel-input/tel-input.component';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {

  PatientForm!: FormGroup
  PatientFormSubmitted: boolean = false;
  PatientFormValue: any;
  myControl = new FormControl();
  options = [];
  filteredOptions: Observable<CanadaPostSuggestItem[]> = new Observable<CanadaPostSuggestItem[]>();
  AddressFieldsEnabled: boolean = false;
  patientFormSpinnerEnabled: boolean = false;
  constructor(private fb: FormBuilder, private serv: ThirdPartyServicesService, private dialog: MatDialog, private pserv: PatientService) { }

  get f() {
    return this.PatientForm.controls;
  }



  ngOnInit(): void {

    this.PatientForm = this.fb.group({
      firstName: ['',],
      lastName: ['',],
      birthDate: ['',],
      email: ['',],
      cell: new FormControl(new MyTel('', '', '')),
      phone: new FormControl(new MyTel('', '', '')),
      streetName: ['',],
      streetNum: ['',],
      healthCard: ['',],
      insuranceCompany: ['',],
      City: ['',],
      Province: ['',],
      PostalCode: ['',],
      Country: ['',],
      BuildingName: ['',],
      BuildingNum: ['',],
      SubBuilding: ['',],
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => {
        return this.filter(val || '')
      })
    );
    this.filteredOptions.subscribe(x => {
      console.log(x);
    });


    this.serv.VerifyEmail('williamnodfah@gmail.com').subscribe(x => {
      console.log(x);
    });
  }

  onPatientFormSubmit = (e: any) => {
    this.PatientFormSubmitted = true;
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
    p.phone = '(' + this.PatientForm.get('phone')?.value.area + ')' +
      ' ' + this.PatientForm.get('phone')?.value.exchange +
      '-' + this.PatientForm.get('phone')?.value.subscriber;

    p.fullAddress = this.myControl.value.Text;

    this.pserv.getParamZcodesStr('email', p.email).subscribe(x => {
      p.emailZcodes = x;
      this.pserv.getParamZcodesStr('home', p.phone).subscribe(y => {
        p.phoneZcodes = y;
        this.pserv.getParamZcodesStr('mobile', p.phone).subscribe(z => {
          p.cellZcodes = z;
          this.serv.VerifyEmailBool(p.email).subscribe(a => {
            p.isValidEmail = a;
            console.log(p);
            this.pserv.sendEmail(p).subscribe(b => {
              console.log(b);
              this.patientFormSpinnerEnabled = false;
            });
          });
        });
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
            this.PatientForm.controls.City.setValue(result.City);
            this.PatientForm.controls.Province.setValue(result.Province);
            this.PatientForm.controls.PostalCode.setValue(result.PostalCode);
            this.PatientForm.controls.Country.setValue(result.CountryName);
            this.PatientForm.controls.BuildingName.setValue(result.BuildingName);
            this.PatientForm.controls.BuildingNum.setValue(result.BuildingNumber);
            this.PatientForm.controls.SubBuilding.setValue(result.SubBuilding);
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
        this.PatientForm.controls.City.setValue(result.City);
        this.PatientForm.controls.Province.setValue(result.Province);
        this.PatientForm.controls.PostalCode.setValue(result.PostalCode);
        this.PatientForm.controls.Country.setValue(result.CountryName);
        this.PatientForm.controls.BuildingName.setValue(result.BuildingName);
        this.PatientForm.controls.BuildingNum.setValue(result.BuildingNumber);
        this.PatientForm.controls.SubBuilding.setValue(result.SubBuilding);
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
