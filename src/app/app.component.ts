import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'schoolFrontEnd';
  isHomePage = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isHomePage = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
      // Scroll to top on every route change (body is the scroll container)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }
}
