import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

const ROUTE_TITLES: Record<string, string> = {
  '/user/home': 'Dashboard',
  '/user/checkResults': 'Check Results',
  '/user/checkEligilibilty': 'Eligibility Reports',
};

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {

  @Output() sidebarToggle = new EventEmitter<void>();

  userName: string = '';
  userInitial: string = '';
  dropdownOpen = false;
  pageTitle = 'Dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(fullName => {
      this.userName = fullName ?? '';
      this.userInitial = this.userName ? this.userName.charAt(0).toUpperCase() : '?';
    });
    this.authService.initializeUserFromToken();

    this.setTitle(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.setTitle(e.urlAfterRedirects));
  }

  private setTitle(url: string): void {
    const match = Object.keys(ROUTE_TITLES).find(k => url.startsWith(k));
    this.pageTitle = match ? ROUTE_TITLES[match] : 'Dashboard';
  }

  onMenuClick(): void {
    this.sidebarToggle.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.userName = '';
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('auth_token');
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }

  // Close dropdown only when clicking OUTSIDE this component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen = false;
    }
  }
}
