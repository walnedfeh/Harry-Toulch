import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { PatientService } from "../services/patient.service";
import { ThirdPartyServicesService } from "../services/third-party-services-service";

@Injectable({ providedIn: 'root' })
export class EmailAsyncValidator implements AsyncValidator {
    constructor(private serv: ThirdPartyServicesService, private pserv: PatientService) { }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        if (!ctrl.value) {
            return of(null);
        }
        return this.serv.VerifyEmailBoolBlur(ctrl.value).pipe(map((valid: boolean) => {
            return valid ? null : { notValidEmail: true };
        }), catchError(() => of(null)));
    }


    zCodeAsyncValidator(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.pserv.getPatientbyId(ctrl.value.split('Z')[1]).pipe(map((valid: boolean) => {
            console.log(valid);
            return valid ? null : { notValidzCode: true };
        }), catchError(() => of(null)));
    }
}

