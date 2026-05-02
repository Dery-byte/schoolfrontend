import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/services/authentication.service';
import { User } from 'src/app/services/models/user';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;

  constructor(private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }
}
