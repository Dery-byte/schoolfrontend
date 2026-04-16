import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent implements OnInit {

  @Input() isOpen = false;

  userName: string = '';
  userInitial: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(fullName => {
      this.userName = fullName ?? '';
      this.userInitial = this.userName ? this.userName.charAt(0).toUpperCase() : '?';
    });
    this.authService.initializeUserFromToken();
  }
}
