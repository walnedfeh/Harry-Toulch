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
    result.city = p.City;
    result.province = p.Province;
    result.country = p.Country;
    if (p.insuranceCompany) {
        result.medicalCard = p.insuranceCompany;
    }
    if (p.healthCard) {
        result.medicalCardExp = p.healthCard;
    }
    result.isDefaultSms = p.preferedContact == 'SMS' ? true : false;
    result.isDefaultEmail = !result.isDefaultSms;
    result.postalCode = p.PostalCode;
    result.streetNumber = p.BuildingNum;
    result.unit = p.SubBuilding;
    result.isDefaultSms = true;
    result.isDefaultEmail = false;
    return result;
}