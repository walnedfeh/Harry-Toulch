import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginBody } from '../models/login-body';
import { PatientService } from '../services/patient.service';

@Injectable()
export class PatientsInterceptionsInterceptor implements HttpInterceptor {
  private Url: string = environment.ApiUrl;
  private accountsId: number = 2040;
  private storeId: number = 1;
  private nonInterceptedRequests: string[] = [
    'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws',
    'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws',
    'https://api.email-validator.net/api/verify',
    this.Url + '/login/doctors'
  ];
  constructor(private router: Router, private http: HttpClient, private serv: PatientService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let url: string = this.Url + '/login/doctors';
    if (this.nonInterceptedRequests.includes(request.url)) {
      console.log('not intercepting ' + request.url);
      return next.handle(request);
    } else {
      console.log('intercepting ' + request.url);
      if (request.url == url) {
        return next.handle(request).pipe(
          retry(1),
          catchError((error: HttpErrorResponse) => {
            let errorMessage: string = '';
            if (error.error instanceof ErrorEvent) {
              // client-side error
              errorMessage = `Error: ${error.error.message}`;
            } else {
              // server-side error
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

              switch (error.status) {
                case 400:      //bad request
                  errorMessage += '   bad request';
                  break;
                case 401:      //login
                  errorMessage += '   unauthorized';
                  break;
                case 403:     //forbidden
                  errorMessage += '   forbidden';
                  break;
                case 404:     //not found
                  errorMessage += '   not found';
                  break;
                case 405:     //method nor allowed
                  errorMessage += '   method nor allowed';
                  break;
                case 500:     //internal server error
                  errorMessage += '   internal server error';
                  break;
                case 502:     //bad gateway
                  errorMessage += '   bad gateway';
                  break;
              }
            }
            let params: NavigationExtras = {
              queryParams: {
                "error": errorMessage,
              }
            };
            this.router.navigate(['/error',], params);
            return throwError(errorMessage);
          })
        );;
      }
      else {
        let loginBody: LoginBody = new LoginBody();
        loginBody.accountsId = this.accountsId;
        loginBody.storeId = this.storeId
        return this.serv.getToken(loginBody).pipe(switchMap((reponse) => {
          request = request.clone({
            setHeaders: {
              'Content-Type': 'application/json',
              'Accept': 'application/json,*/*',
              'token': reponse
            }
          });
          return next.handle(request).pipe(
            retry(1),
            catchError((error: HttpErrorResponse) => {
              let errorMessage: string = '';
              if (error.error instanceof ErrorEvent) {
                // client-side error
                errorMessage = `Error: ${error.error.message}`;
              } else {
                // server-side error
                errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

                switch (error.status) {
                  case 400:      //bad request
                    errorMessage += '   bad request';
                    break;
                  case 401:      //login
                    errorMessage += '   unauthorized';
                    break;
                  case 403:     //forbidden
                    errorMessage += '   forbidden';
                    break;
                  case 404:     //not found
                    errorMessage += '   not found';
                    break;
                  case 405:     //method nor allowed
                    errorMessage += '   method nor allowed';
                    break;
                  case 500:     //internal server error
                    errorMessage += '   internal server error';
                    break;
                  case 502:     //bad gateway
                    errorMessage += '   bad gateway';
                    break;
                }
              }
              let params: NavigationExtras = {
                queryParams: {
                  "error": errorMessage,
                }
              };
              this.router.navigate(['/error',], params);
              return throwError(errorMessage);
            })
          );
        }));
      }
    }
  }

}
