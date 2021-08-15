import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-contact-form-base-content',
  templateUrl: './contact-form-base-content.component.html',
  styleUrls: ['./contact-form-base-content.component.css']
})
export class ContactFormBaseContentComponent implements OnInit {

  logoWidthValue: boolean = true;
  constructor() {
    this.logoWidthValue = window.innerWidth > 500 ? true : false;
  }

  ngOnInit(): void {

  }


}
