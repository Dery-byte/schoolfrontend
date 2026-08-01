import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthenticationService } from 'src/app/services/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

  userName: string = '';
  userInitial: string = 'A';

  constructor(
    private authenticationService: AuthenticationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.userName = user ?? '';
      this.userInitial = this.userName ? this.userName.charAt(0).toUpperCase() : 'A';
    });
    this.authService.initializeUserFromToken();
  }

  logout(): void {
    this.userName = '';
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('auth_token');
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }
}
