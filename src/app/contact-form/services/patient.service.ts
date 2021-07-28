import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AddPatientRequest } from '../models/add-patient-request';
import { LoginBody } from '../models/login-body';
import { Param } from '../models/param';
import { Patient } from '../models/patient';
import { Patientdata } from '../models/patientdata';
import { ZCodeMatch } from '../models/z-code-match';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  ApiUrl: string = environment.ApiUrl;
  constructor(private http: HttpClient) { }

  createNewPatient(_body: AddPatientRequest, _token: string): Observable<boolean> {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json,*/*',
        'Content-Type': 'application/json',
        'token': _token
      }),
    };
    return this.http.post<boolean>(this.ApiUrl + '/Patient', _body, options).pipe(map((data: any) => {
      let tempData = data["patient"];
      return tempData ? true : false;
    }));
  }
  getPatientsList(_param: string, _paramVal: string): Observable<Patient[]> {
    const params = new HttpParams().set(_param, _paramVal).set('match', 'all');
    return this.http.get<Patient[]>(this.ApiUrl + '/Patient/list', { params }).pipe(
      map((data: any) => {
        let tempData = data["patientList"];
        let result: Patient[] = [];
        for (let i = 0; i < tempData.length; i++) {
          let s: Patient = new Patient();
          s = Object.assign(s, tempData[i]);
          result.push(s);
        }
        return result;
      })
    );
  }

  getParamZcodesArr(_param: string, _paramVal: string): Observable<string[]> {
    return this.getPatientsList(_param, _paramVal).pipe(
      map((data: Patient[]) => {
        let result: string[] = [];
        data.forEach(x => {
          result.push(x.id);
        });
        return result;
      })
    );
  }

  getParamZcodesMatch(_param: string, _paramVal: string, _formattedParamName: string): Observable<ZCodeMatch> {
    return this.getParamZcodesArr(_param, _paramVal).pipe(map((data: string[]) => {
      let zcmS: ZCodeMatch = new ZCodeMatch();
      data.forEach(x => {
        zcmS.zCodes.push('z' + x.split('-')[1]);
      });
      zcmS.MatchedField = _formattedParamName;
      return zcmS;
    }));
  }

  getParamZcodesStr(_param: string, _paramVal: string): Observable<string> {
    return this.getParamZcodesArr(_param, _paramVal).pipe(
      map((data: string[]) => {
        return data.map(x => {
          let temp = x.split('-')[1];
          return 'z' + temp;
        }).join(',');
      })
    );
  }

  getToken(_body: LoginBody): Observable<string> {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json,*/*',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('carlo:1234')
      }),
    };
    return this.http.post<string>(this.ApiUrl + '/login/doctors', _body, options).pipe(map((data: any) => {
      let token = data['Token'];
      return token;
    }));
  }

  sendEmail(_body: Patientdata) {
    return this.http.post('http://harrytoulchregistration.com/api/contact2.php', _body);
  }

  /*first and last name services */

  getPatientListByFirstLastName(paramsArr: Param[]): Observable<Patient[]> {
    let params: HttpParams = new HttpParams().set('match', 'any').set('email', 'a@a.a');
    paramsArr.forEach(x => {
      params = params.set(x.paramName, x.paramValue);
    });
    return this.http.get<Patient[]>(this.ApiUrl + '/Patient/list', { params }).pipe(
      map((data: any) => {
        let tempData = data["patientList"];
        let result: Patient[] = [];
        for (let i = 0; i < tempData.length; i++) {
          let s: Patient = new Patient();
          s = Object.assign(s, tempData[i]);
          result.push(s);
        }
        return result;
      })
    );
  }

  getPatientListByFirstLastNamezCodesArr(paramsArr: Param[]): Observable<string[]> {
    return this.getPatientListByFirstLastName(paramsArr).pipe(
      map((data: Patient[]) => {
        let result: string[] = [];
        data.forEach(x => {
          result.push(x.id);
        });
        return result;
      })
    );
  }

  getPatientListByFirstLastNamezCodesStr(paramsArr: Param[]): Observable<string> {
    return this.getPatientListByFirstLastNamezCodesArr(paramsArr).pipe(
      map((data: string[]) => {
        return data.map(x => {
          let temp = x.split('-')[1];
          return 'z' + temp;
        }).join(',');
      })
    );
  }

  harryToulchLogin(_userName: string, _password: string, _body: LoginBody): Observable<string> {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json,*/*',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(_userName + ':' + _password)
      }),
    };
    return this.http.post<string>(this.ApiUrl + '/login/doctors', _body, options).pipe(map((data: any) => {
      let token = data['Token'];
      return token;
    }));
  }
}


/* "id": "patient-25406", */