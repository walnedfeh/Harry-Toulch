import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";



export function cellPhoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        const areaNumeric = /[0-9]+/.test(value?.area);
        const exNumeric = /[0-9]+/.test(value?.exchange);
        const SubsNumeric = /[0-9]+/.test(value?.subscriber);
        const cellValidFormat = areaNumeric && exNumeric && SubsNumeric;
        const cellNotRequired = value?.area.length == 3 && value?.exchange.length == 3 && value?.subscriber.length == 4;
        if (cellValidFormat && cellNotRequired) {
            return null;
        } else {
            return { invalidCell: true };
        }

    }
}