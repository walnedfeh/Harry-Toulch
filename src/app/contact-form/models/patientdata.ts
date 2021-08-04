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
    City!: string;
    Province!: string;
    PostalCode!: string;
    Country!: string;
    BuildingNum!: string;
    SubBuilding!: string;
    isValidEmail!: boolean;
    zCodes: ZCodeMatchApi[] = [];
    preferedContact!: string;
    manualAddressSelect!: boolean;
    constructor() {
    }
}
