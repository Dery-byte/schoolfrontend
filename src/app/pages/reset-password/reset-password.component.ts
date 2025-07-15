// reset-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validator: this.checkPasswords });

  token: string;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword=false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private manualService: ManaulServiceService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.errorMessage = 'Invalid reset link';
  }

  checkPasswords(group: any) {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  }

  // onSubmit() {
  //   if (this.resetForm.invalid || !this.token) return;
  //   this.isLoading = true;
  //   this.errorMessage = null;
    
  //   this.manualService.resetPassword(
  //     this.token,
  //     this.resetForm.value.password!
  //   ).subscribe({
  //     next: () => {
  //       this.successMessage = 'Password updated successfully! Redirecting to login...';
  //       setTimeout(() => this.router.navigate(['/login']), 3000);
  //     },
  //     error: (err) => {
  //       this.errorMessage = err.error.message || 'Failed to reset password';
  //       this.isLoading = false;
  //     }
  //   });
  // }




  onSubmit() {
  if (this.resetForm.invalid || !this.token) return;

  this.isLoading = true;
  this.errorMessage = null;

  this.manualService.resetPassword(
    this.token,
    this.resetForm.value.password!
  ).subscribe({
    next: () => {
      this.successMessage = 'Password updated successfully! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/login']), 3000);
    },
    error: (err) => {
      const status = err.status;
      const message = err.error?.message || 'Failed to reset password';

      if (status === 410) {
        // Token expired
        this.errorMessage = 'Your reset link has expired. Please request a new one.';
        setTimeout(() => this.router.navigate(['/forgot-password']), 4000);
      } else if (status === 400 && message.includes("already been used")) {
        // Token already used
        this.errorMessage = 'This reset link has already been used. Please request a new one.';
        setTimeout(() => this.router.navigate(['/forgot-password']), 4000);
      } else {
        this.errorMessage = message;
      }

      this.isLoading = false;
    }
  });
}


  togglePasswordVisibility(field: HTMLInputElement) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}