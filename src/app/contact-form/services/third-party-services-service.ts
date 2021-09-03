import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CanadaPostSuggestItem } from '../models/canada-post-suggest-item';
import { CanadaPostSuggestItemDetails } from '../models/canada-post-suggest-item-details';
import { EmailVerifierResponse } from '../models/email-verifier-response';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyServicesService {
  CanadaPostSuggestURL: string = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws';
  CanadaPostItemDetailsURL: string = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws';
  EmailVerifierURL: string = 'https://api.email-validator.net/api/verify';
  constructor(private http: HttpClient) { }

  /*Third Party Services Integration*/

  getCanadaPostSuggestedItems(searchItem: string, Country: string, Lang: string, LastId?: string): Observable<CanadaPostSuggestItem[]> {
    let params = new HttpParams().set('Key', environment.CanadaPostAPIKey)
      .set('SearchTerm', searchItem)
      .set('SearchFor', 'Everything')
      .set('LanguagePreference', Lang)
      .set('Country', Country)
      .set('MaxSuggestions', '7')
      .set('MaxResults', '100');
    if (LastId != null) {
      params = new HttpParams().set('Key', environment.CanadaPostAPIKey)
        .set('SearchTerm', searchItem)
        .set('LanguagePreference', Lang)
        .set('SearchFor', 'Everything')
        .set('LastId', LastId)
        .set('Country', Country)
        .set('MaxSuggestions', '7')
        .set('MaxResults', '100');
    }
    return this.http.get<any[]>(this.CanadaPostSuggestURL, { params }).pipe(map((data: any) => {
      let tempdata = data["Items"];
      let result: CanadaPostSuggestItem[] = [];
      for (let i = 0; i < tempdata?.length; i++) {
        let s: CanadaPostSuggestItem = new CanadaPostSuggestItem();
        s = Object.assign(s, tempdata[i]);
        result.push(s);
      }
      return result;
    }));
  }

  getCanadaPostItemDetails(Id: string): Observable<CanadaPostSuggestItemDetails[]> {
    const params = new HttpParams().set('Key', environment.CanadaPostAPIKey)
      .set('Id', Id);
    return this.http.get<any[]>(this.CanadaPostItemDetailsURL, { params }).pipe(map((data: any) => {
      let tempdata = data["Items"];
      let result: CanadaPostSuggestItemDetails[] = [];
      for (let i = 0; i < tempdata?.length; i++) {
        let s: CanadaPostSuggestItemDetails = new CanadaPostSuggestItemDetails();
        s = Object.assign(s, tempdata[i]);
        result.push(s);
      }
      return result;
    }));
  }

  VerifyEmail(_email: string): Observable<EmailVerifierResponse> {
    const params = new HttpParams()
      .set('APIKey', environment.EmailVerfierAPIKey)
      .set('EmailAddress', _email);
    return this.http.get<EmailVerifierResponse>(this.EmailVerifierURL, { params });
  }

  VerifyEmailBool(_email: string): Observable<boolean> {
    return this.VerifyEmail(_email).pipe(map((data: EmailVerifierResponse) => {
      if (data.status == '200' && data.info == 'OK - Valid Address')
        return true;
      else
        return false;
    }));
  }


  VerifyEmailBoolBlur(_email: string): Observable<boolean> {
    return this.VerifyEmailBool(_email).pipe();
  }



}


/*
canada post:
Najjar.nadeem@hotmail.com
email verfy:
w.alnedfeh@itsnerd.com
*/

/*
https://webstart.downloadwink.com/webstart/4353_N-WITS_U1GJ/launch.jnlp eyemaxx testing
https://webstart.downloadwink.com/webstart/50048/launch.jnlp wink world
*/

