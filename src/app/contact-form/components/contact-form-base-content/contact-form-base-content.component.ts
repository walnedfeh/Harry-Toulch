import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-contact-form-base-content',
  templateUrl: './contact-form-base-content.component.html',
  styleUrls: ['./contact-form-base-content.component.css']
})
export class ContactFormBaseContentComponent implements OnInit {
  LanguageValue: string = 'en';
  LanguageSelectionDialog: boolean = true;
  supportLanguages = ['en', 'fr'];
  constructor(private translateService: TranslateService) {
    this.translateService.addLangs(this.supportLanguages);
    this.translateService.setDefaultLang('en');
    const browserlang = this.translateService.getBrowserLang();
    if (this.supportLanguages.includes(browserlang)) {
      this.translateService.use(browserlang);
      this.LanguageValue = browserlang;
    }
  }

  ngOnInit(): void {

  }

  MatSelectLanguage() {
    this.translateService.use(this.LanguageValue);
  }

  DialogSelectLanguage(_lang: string) {
    this.LanguageValue = _lang;
    this.translateService.use(this.LanguageValue);
    this.LanguageSelectionDialog = false;
  }
}
