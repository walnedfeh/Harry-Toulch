import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ThirdPartyServicesService } from "../services/third-party-services-service";

@Injectable({ providedIn: 'root' })
export class EmailAsyncValidator implements AsyncValidator {
    constructor(private serv: ThirdPartyServicesService) { }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.serv.VerifyEmailBoolBlur(ctrl.value).pipe(map((valid: boolean) => {
            return valid ? null : { notValidEmail: true };
        }), catchError(() => of(null)));
    }
}