import { ZCodeMatchApi } from "./z-code-match-api";

export class Patientdata {
    firstName!: string;
    lastName!: string;
    birthDate!: string;
    email!: string;
    cell!: string;
    phone!: string;
    fullAddress!: string;
    streetName!: string;
    healthCard!: string;
    insuranceCompany!: string;
    city!: string;
    province!: string;
    postalCode!: string;
    country!: string;
    buildingNum!: string;
    subBuilding!: string;
    isValidEmail!: boolean;
    zCodes: ZCodeMatchApi[] = [];
    preferedContact!: string;
    manualAddressSelect!: boolean;
    firstVisitOption!: boolean;
    constructor() {
    }
}
