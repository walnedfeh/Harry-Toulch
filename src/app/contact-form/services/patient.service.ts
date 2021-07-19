import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginBody } from '../models/login-body';
import { Patient } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  ApiUrl: string = environment.ApiUrl;
  constructor(private http: HttpClient) { }

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

}
