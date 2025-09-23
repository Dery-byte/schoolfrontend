import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationRequest } from '../../services/models/authentication-request';
import { AuthenticationService } from 'src/app/services/services';
import { TokenService } from 'src/app/services/token/token.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { decodeToken } from 'src/app/Utilities/token.util';
import { AuthService } from 'src/app/auth/auth.service';
import { RegistrationRequest } from '../../services/models/registration-request';
import { delay } from 'rxjs';
import { BlurService } from 'src/app/shared/blur/blur.service';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';





@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  // encapsulation: ViewEncapsulation.None // <-- Add this

})
export class LoginComponent {


































  //USER LOGOUT








  //USER LOGIN

  user = {
    email: '',
    password: ''
  };

  success = false;
  authRequest: AuthenticationRequest = { email: '', password: '' };
  registerRequest: RegistrationRequest = { email: '', firstname: '', lastname: '', password: '', phoneNumber: [''] };

  errorMsg: Array<string> = [];

  errorMsgReg: Array<string> = [];


  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    // private ss: KeycloakService,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private router: Router,
    private authService: AuthService,
    private blurService: BlurService,
    private manualService: ManaulServiceService

  ) {
  }

  async ngOnInit(): Promise<void> {
    // await this.ss.init();
    // await this.ss.login();

    this.oauth2Login();
  }


  oauth2Login(){
    // OAUTH2 LOGIN CONFIGURATION
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    this.tokenService.token = token;
    const decoded = decodeToken(token);
    this.authService.setUser(decoded!.sub);
    this.router.navigate(['/user/home']); // or based on role
  }
}


  login() {
    this.errorMsg = [];
    this.authenticationService.authenticate({
      body: this.authRequest
    }).subscribe({
      next: (res) => {
        const token = res.token as string;
        this.tokenService.token = token;

        // Use the utility to decode the token
        const decodedToken = decodeToken(token);
        console.log(decodeToken);
        console.log(token);

        if (decodedToken) {
          const username = decodedToken.sub; // 'sub' usually contains the username in JWT
    this.authService.setUser(res.fullName || username); // ✅ change here
        }
        if (decodedToken && decodedToken.authorities) {
          this.navigateBasedOnRole(decodedToken.authorities);
        } else {
          // this.router.navigate(['home']); // Default route if no authorities are found
        }
      },
      error: (err) => {
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

  navigateBasedOnRole(authorities: string[]) {
    if (authorities.includes('ADMIN')) {
      this.router.navigate(['/admin', 'dashboard']);      // Navigate to admin dashboard
    } else if (authorities.includes('USER')) {
      this.router.navigate(['user', 'home']); // Navigate to user dashboard
    } else {
      this.router.navigate(['']); // Default route for other roles
    }
  }


  paymentForm = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
    payer: new FormControl('', [Validators.required, Validators.pattern(/^0\d{9}$/)])
  });


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



  showSuccessMessage = false;
  isSubmitting = false;

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



  setMessageDisplayTime(): void {
    setTimeout(() => {
      this.errorMsg = [];
      this.errorMsgReg = [];
      this.success = false;
    }, 3000);
  }


  //REGISTER

  register() {
    this.loading = true;
    this.errorMsgReg = [];

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
          this.errorMsgReg = err.error.validationErrors;
          this.setMessageDisplayTime();
        }
      });
  }

}
