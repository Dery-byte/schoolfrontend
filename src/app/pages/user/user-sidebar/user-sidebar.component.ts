import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent implements OnInit {

  @Input()  isOpen = false;
  @Output() sidebarClose = new EventEmitter<void>();

  userName: string = '';
  userInitial: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(fullName => {
      this.userName = fullName ?? '';
      this.userInitial = this.userName ? this.userName.charAt(0).toUpperCase() : '?';
    });
    this.authService.initializeUserFromToken();
  }

  closeSidebar(): void {
    this.sidebarClose.emit();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('auth_token');
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }
}
