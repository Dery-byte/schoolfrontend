import { Component } from '@angular/core';
import { BlurService } from 'src/app/shared/blur/blur.service';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { TokenService } from 'src/app/services/token/token.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { decodeToken } from 'src/app/Utilities/token.util';
import { AuthService } from 'src/app/auth/auth.service';
import { RegistrationRequest } from '../../services/models/registration-request';
import { delay } from 'rxjs';
import { AuthenticationRequest } from '../../services/models/authentication-request';
import { AuthenticationService } from 'src/app/services/services';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {


  constructor(
    private blurService: BlurService,
    private manualService: ManaulServiceService,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private router: Router,
    private authService: AuthService,

  ) {
  }


  showSuccessMessage = false;
  isSubmitting = false;
  loading: boolean = false;


  user = {
    email: '',
    password: ''
  };

  success = false;
  authRequest: AuthenticationRequest = { email: '', password: '' };

  registerRequest: RegistrationRequest = {
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ['']
  };
  errorMsg: Array<string> = [];

  errorMsgReg: Array<string> = [];

  // errorMsgInternal: Array<string> = [];
  errorMsgInternal: string[] = [];


  activeForm: 'login' | 'register' = 'login';
  // Password visibility states
  showPassword = false;
  showRegPassword = false;
  showConfirmPassword = false;

  toggleForm(formType: 'login' | 'register'): void {
    this.activeForm = formType;
  }

  get switchText(): string {
    return this.activeForm === 'login'
      ? "Don't have an account? "
      : "Already have an account? ";
  }

  get switchLinkText(): string {
    return this.activeForm === 'login'
      ? "Create Account"
      : "Sign In";
  }


  togglePasswordVisibility(field: 'password' | 'regPassword' | 'confirmPassword') {
    switch (field) {
      case 'password':
        this.showPassword = !this.showPassword;
        break;
      case 'regPassword':
        this.showRegPassword = !this.showRegPassword;
        break;
      case 'confirmPassword':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
  getPasswordType(field: 'password' | 'regPassword' | 'confirmPassword'): string {
    switch (field) {
      case 'password': return this.showPassword ? 'text' : 'password';
      case 'regPassword': return this.showRegPassword ? 'text' : 'password';
      case 'confirmPassword': return this.showConfirmPassword ? 'text' : 'password';
      default: return 'password';
    }
  }

  getEyeIconClass(field: 'password' | 'regPassword' | 'confirmPassword'): string {
    const isVisible =
      (field === 'password' && this.showPassword) ||
      (field === 'regPassword' && this.showRegPassword) ||
      (field === 'confirmPassword' && this.showConfirmPassword);

    return isVisible ? 'eye-icon visible' : 'eye-icon';
  }





  apiError: string | null = null;



  passwordResetRequest() {
    if (this.passwordResetForm.invalid) return;
    console.log('Email submitted:', this.passwordResetForm.value.email);


    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.apiError = null;

    const email = this.passwordResetForm.value.email;

    console.log(email);

    this.manualService.requestPasswordReset(email).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        this.passwordResetForm.reset();
      },
      error: (err) => {
        console.error('Password reset error:', err);
        this.apiError = err.error?.message || 'Failed to send reset link. Please try again.';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }


  loginLoading = false;

  login() {
    this.errorMsg = [];
    this.loginLoading = true;


    this.authenticationService.authenticate({
      body: this.authRequest
    }).subscribe({
      next: (res) => {
        this.loginLoading = false;

        const token = res.token as string;
        this.tokenService.token = token;

        // Use the utility to decode the token
        const decodedToken = decodeToken(token);
        console.log(decodeToken);
        console.log(token);

        if (decodedToken) {
          const username = decodedToken.sub; // 'sub' usually contains the username in JWT

          // Store the username in AuthService
          this.authService.setUser(username);
        }
        if (decodedToken && decodedToken.authorities) {
          this.navigateBasedOnRole(decodedToken.authorities);
        } else {
          // this.router.navigate(['home']); // Default route if no authorities are found
        }
      },
      error: (err) => {
        this.loginLoading = false;
        console.log(err);
        if (err.error.validationErrors) {
          this.errorMsg = err.error.validationErrors;
          this.errorMsg.push(err.error.error);
          this.setMessageDisplayTime();
        } else {
          this.errorMsg.push(err.error.error);
          this.setMessageDisplayTime();
        }
      }
    });
  }



  validateRegistration(): boolean {
    this.errorMsgReg = [];

    if (
      this.registerRequest.password &&
      this.registerRequest.confirmPassword &&
      this.registerRequest.password !== this.registerRequest.confirmPassword
    ) {
      this.errorMsgReg.push('Passwords do not match.');
      return false;
    }

    return true;
  }



  register() {
    this.loading = true;
    this.errorMsgReg = [];
    this.errorMsgInternal = [];


    console.log(this.registerRequest);



    const ghanaRegex = /^(?:\+233|0)[235][0-9]{8}$/;
    if (!ghanaRegex.test(this.registerRequest.phoneNumber[0])) {
      this.errorMsgReg = ['Invalid phone number'];
      this.loading = false;
      this.setMessageDisplayTime();
      return;
    }

    if (!this.validateRegistration()) {
      this.loading = false;
      this.setMessageDisplayTime();
      return;
    }

    this.authenticationService.register({
      body: this.registerRequest
    })
      .pipe(delay(3000))
      .subscribe({
        next: () => {
          this.loading = false;
          // Set the flag before navigation
          this.authService.setComingFromRegistration(true);
          this.router.navigate(['/activate-account']);
        },
        error: (err) => {
          this.loading = false;
          const backendMessage = err?.error?.businessErrorDescription;
          this.errorMsgInternal.push(backendMessage);
                   this.errorMsgReg = err.error.validationErrors || [];
          this.setMessageDisplayTime();
        }
      });
  }










  navigateBasedOnRole(authorities: string[]) {
    if (authorities.includes('ADMIN')) {
      this.router.navigate(['/admin', 'dashboard']);      // Navigate to admin dashboard
    } else if (authorities.includes('USER')) {
      this.router.navigate(['user', 'home']); // Navigate to user dashboard
    } else {
      this.router.navigate(['']); // Default route for other roles
    }
  }






  setMessageDisplayTime(): void {
    setTimeout(() => {
      this.errorMsg = [];
      this.errorMsgReg = [];
      this.errorMsgInternal=[];
      this.success = false;
    }, 3000);
  }





















  showorgottenPasswordModal = false;
  passwordResetForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });




  openFogottenModal() {
    console.log("Opening password reset modal");
    this.showorgottenPasswordModal = true;
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
  }

  closeFogottenModal() {
    this.showorgottenPasswordModal = false;
    document.body.style.overflow = '';
    this.blurService.setBlur(false);
  }
}
