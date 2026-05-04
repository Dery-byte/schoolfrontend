import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/services/models/user';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  
  // Modal state
  showAssignModal = false;
  selectedUser: User | null = null;
  customCode: string = '';
  customPackage: string = 'PREMIUM';
  customPrice: number = 5.00;
  customDiscountMode: string = 'MANUAL';
  customThreshold: number = 3;
  isAssigning = false;

  constructor(private authService: AuthenticationService, private http: HttpClient, private manualService: ManaulServiceService, private snackBar: MatSnackBar) { }

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

  openAssignModal(user: User): void {
    this.selectedUser = user;
    this.customCode = '';
    this.customPackage = 'PREMIUM';
    this.customPrice = 5.00;
    this.customDiscountMode = user.discountGenerationMode || 'MANUAL';
    this.customThreshold = user.discountCheckThreshold || 3;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedUser = null;
    this.customCode = '';
    this.customPackage = 'PREMIUM';
    this.customPrice = 5.00;
    this.customDiscountMode = 'MANUAL';
    this.customThreshold = 3;
  }

  confirmAssignDiscount(): void {
    if (!this.selectedUser) return;
    this.isAssigning = true;
    
    const payload = { 
      discountCode: this.customCode,
      discountPackage: this.customPackage,
      discountPrice: this.customPrice.toString(),
      discountMode: this.customDiscountMode,
      discountThreshold: this.customThreshold.toString()
    };
    
    this.http.post<any>(`http://localhost:8088/api/v1/auth/admin/users/${this.selectedUser.id}/discount`, payload).subscribe({
      next: (res) => {
        alert(res.message);
        if (this.selectedUser) {
          this.selectedUser.discountCode = res.discountCode;
          this.selectedUser.discountPackage = this.customPackage;
          this.selectedUser.discountPrice = this.customPrice;
          this.selectedUser.discountGenerationMode = this.customDiscountMode;
          this.selectedUser.discountCheckThreshold = this.customThreshold;
        }
        this.isAssigning = false;
        this.closeAssignModal();
      },
      error: (err) => {
        console.error('Error assigning discount code:', err);
        alert('Failed to assign discount code.');
        this.isAssigning = false;
      }
    });
  }

  toggleUserStatus(user: User): void {
    if (!user.id) return;
    const previousStatus = user.enabled;
    user.enabled = !user.enabled; // Optimistic update

    this.manualService.toggleUserStatus(user.id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'User status updated', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        user.enabled = previousStatus; // Revert on failure
        this.snackBar.open('Failed to update user status.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  revokeDiscountCode(user: User): void {
    if (!confirm(`Are you sure you want to revoke the discount code for ${user.firstname}?`)) return;

    this.http.delete<any>(`http://localhost:8088/api/v1/auth/admin/users/${user.id}/discount`).subscribe({
      next: (res) => {
        alert(res.message);
        user.discountCode = undefined;
        user.discountPackage = undefined;
        user.discountPrice = undefined;
        user.discountGenerationMode = 'MANUAL';
        user.discountCheckThreshold = undefined;
      },
      error: (err) => {
        console.error('Error revoking discount code:', err);
        alert('Failed to revoke discount code.');
      }
    });
  }
}
