import { AddPatientRequest } from "../models/add-patient-request";
import { Patientdata } from "../models/patientdata";

export function InitializePatientData(p: Patientdata): AddPatientRequest {
    let result: AddPatientRequest = new AddPatientRequest();
    result.firstName = p.firstName;
    result.lastName = p.lastName;
    result.email = p.email;
    result.dateOfBirth = p.birthDate;
    result.cell = p.cell;
    if (p.phone) {
        result.phone = p.phone;
    }
    result.streetName = p.streetName;
    result.city = p.city;
    result.province = p.province;
    result.country = p.country;
    if (p.insuranceCompany) {
        result.medicalCard = p.insuranceCompany;
    }
    if (p.healthCard) {
        result.medicalCardExp = p.healthCard;
    }
    result.isDefaultSms = p.preferedContact == 'SMS' ? true : false;
    result.isDefaultEmail = !result.isDefaultSms;
    result.postalCode = p.postalCode;
    result.streetNumber = p.buildingNum;
    result.unit = p.subBuilding;
    result.isDefaultSms = true;
    result.isDefaultEmail = false;
    return result;
}