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
import { Updatepatientrequest } from '../models/update-patient-request';
import { ZCodeMatch } from '../models/z-code-match';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  ApiUrl: string = environment.ApiUrl;
  constructor(private http: HttpClient) { }

  createNewPatient(_body: AddPatientRequest, _token: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json,*/*',
        'Content-Type': 'application/json',
        'token': _token
      }),
    };
    return this.http.post<any>(this.ApiUrl + '/Patient', _body, options).pipe(map((data: any) => {
      let tempData = data["patient"];
      let patientId = (<string>tempData?.id).split('-')[1];
      return patientId ? { result: true, id: patientId } : { result: false, id: '' };
    }));
  }

  updatePatient(_body: Updatepatientrequest, _token: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json,*/*',
        'Content-Type': 'application/json',
        'token': _token
      }),
    };
    return this.http.put<any>(this.ApiUrl + '/Patient', _body, options).pipe(map((data: any) => {
      let tempData = data["patient"];
      let patientId = (<string>tempData?.id).split('-')[1];
      return patientId ? { result: true, id: patientId } : { result: false, id: '' };
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
        'Authorization': 'Basic ' + btoa(environment.loginUserName + ':' + environment.loginPassword)
      }),
    };
    return this.http.post<string>(this.ApiUrl + '/login/doctors', _body, options).pipe(map((data: any) => {
      let token = data['Token'];
      return token;
    }));
  }

  sendEmail(_body: Patientdata) {
    return this.http.post('https://harrytoulchregistration.com/api/contact2.php', _body);
  }

  /*first and last name services */

  getPatientListByFirstLastName(_firstName: string, _lastName: string): Observable<Patient[]> {
    let params: HttpParams = new HttpParams()
      .set('firstName', _firstName)
      .set('lastName', _lastName);

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

  getPatientListByFirstLastNamezCodesArr(_firstName: string, _lastName: string): Observable<string[]> {
    return this.getPatientListByFirstLastName(_firstName, _lastName).pipe(
      map((data: Patient[]) => {
        let result: string[] = [];
        data.forEach(x => {
          result.push(x.id);
        });
        return result;
      })
    );
  }

  getPatientListByFirstLastNameZcodesMatch(_firstName: string, _lastName: string, _formattedParamName: string): Observable<ZCodeMatch> {
    return this.getPatientListByFirstLastNamezCodesArr(_firstName, _lastName).pipe(map((data: string[]) => {
      let zcmS: ZCodeMatch = new ZCodeMatch();
      data.forEach(x => {
        zcmS.zCodes.push('z' + x.split('-')[1]);
      });
      zcmS.MatchedField = _formattedParamName;
      return zcmS;
    }));
  }

  getPatientListByFirstLastNamezCodesStr(_firstName: string, _lastName: string): Observable<string> {
    return this.getPatientListByFirstLastNamezCodesArr(_firstName, _lastName).pipe(
      map((data: string[]) => {
        return data.map(x => {
          let temp = x.split('-')[1];
          return 'z' + temp;
        }).join(',');
      })
    );
  }



  getPatientbyId(_zCode: string): Observable<boolean> {

    return this.http.get<boolean>(this.ApiUrl + '/Patient/' + _zCode).pipe(map((data: any) => {
      return data != null ? true : false;
    }));
  }


  /*Harru Toulch Security Login*/
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

