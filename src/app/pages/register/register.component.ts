import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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
import { GuestService } from 'src/app/Utilities/guest.service';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {


  constructor(
    private blurService: BlurService,
    private manualService: ManaulServiceService,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private router: Router,
    private authService: AuthService,
    private guestService: GuestService,

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
        const username = res.lastName;
                  this.authService.setUser(username);
                  console.log(username);


        // Use the utility to decode the token
        const decodedToken = decodeToken(token);
        console.log(decodeToken);
        console.log(token);

        if (decodedToken) {
          // const username = decodedToken.sub; // 'sub' usually contains the username in JWT

          // Store the username in AuthService
          this.authService.setUser(username);
        }
        if (decodedToken && decodedToken.authorities) {
          this.attachGuestSessionIfPresent();
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



  // validateRegistration(): boolean {
  //   this.errorMsgReg = [];
  //   if (
  //     this.registerRequest.password &&
  //     this.registerRequest.confirmPassword &&
  //     this.registerRequest.password !== this.registerRequest.confirmPassword
  //   ) {
  //     this.errorMsgReg.push('Passwords do not match.');
  //     return false;
  //   }

  //   return true;
  // }

  validateRegistration(): boolean {
  this.errorMsgReg = [];

  if (!this.registerRequest.password || !this.registerRequest.confirmPassword) {
    this.errorMsgReg.push('Password and Confirm Password are required.');
    return false;
  }

  if (this.registerRequest.password !== this.registerRequest.confirmPassword) {
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
          // Preserve guest session across registration flow
          const urlParams = new URLSearchParams(window.location.search);
          const pendingSessionId = urlParams.get('sessionId');
          if (pendingSessionId) {
            this.guestService.saveSessionId(pendingSessionId);
          }
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










  private attachGuestSessionIfPresent(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const pendingSessionId = urlParams.get('sessionId') || this.guestService.getSessionId();
    if (pendingSessionId) {
      this.guestService.attachTempReportToUser(pendingSessionId).subscribe({
        next: () => this.guestService.clearSession(),
        error: (err) => console.warn('Guest report attach failed (non-blocking):', err)
      });
    }
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





















  // ── University Network Animation ───────────────────────────────────────
  uniNodes = [
    { x: 12, y: 16, abbr: 'UG',     shortName: 'Univ. of Ghana',  color: '#1d4ed8', glow: 'rgba(29,78,216,0.5)'   },
    { x: 82, y: 13, abbr: 'KNUST',  shortName: 'KNUST',           color: '#16a34a', glow: 'rgba(22,163,74,0.5)'   },
    { x: 8,  y: 70, abbr: 'UCC',    shortName: 'Cape Coast',      color: '#dc2626', glow: 'rgba(220,38,38,0.5)'   },
    { x: 88, y: 67, abbr: 'UPSA',   shortName: 'UPSA',            color: '#7c3aed', glow: 'rgba(124,58,237,0.5)'  },
    { x: 22, y: 87, abbr: 'GIMPA',  shortName: 'GIMPA',           color: '#d97706', glow: 'rgba(217,119,6,0.5)'   },
    { x: 76, y: 84, abbr: 'ASHESI', shortName: 'Ashesi Univ.',    color: '#db2777', glow: 'rgba(219,39,119,0.5)'  },
  ];

  ballX  = 12;
  ballY  = 16;
  ballColor = '#1d4ed8';
  ballGlow  = 'rgba(29,78,216,0.6)';
  engineGlowing = false;
  engineMessage = '';
  engineMessageVisible = false;
  glowingUniIdx = -1;
  private lastUniIdx = 0;
  private animTimeout: any;

  ngAfterViewInit(): void {
    setTimeout(() => this.startAnimation(), 1200);
  }

  ngOnDestroy(): void {
    if (this.animTimeout) clearTimeout(this.animTimeout);
  }

  private startAnimation(): void {
    this.moveToEngine(this.uniNodes[0]);
  }

  private moveToNextUni(): void {
    let next: number;
    do { next = Math.floor(Math.random() * this.uniNodes.length); }
    while (next === this.lastUniIdx);
    this.lastUniIdx = next;
    const uni = this.uniNodes[next];
    this.ballX = uni.x;
    this.ballY = uni.y;
    this.ballColor = uni.color;
    this.ballGlow = uni.glow;
    // Glow the university logo after ball arrives (1.6s travel)
    this.animTimeout = setTimeout(() => {
      this.glowingUniIdx = next;
      // Brief pause at uni with glow, then depart to engine
      this.animTimeout = setTimeout(() => {
        this.glowingUniIdx = -1;
        this.moveToEngine(uni);
      }, 700);
    }, 1600);
  }

  private moveToEngine(uni: any): void {
    this.ballX = 50;
    this.ballY = 50;
    this.animTimeout = setTimeout(() => {
      this.engineGlowing = true;
      this.engineMessage = `Checking ${uni.shortName} eligibility…`;
      this.engineMessageVisible = true;
      this.animTimeout = setTimeout(() => {
        this.engineGlowing = false;
        this.engineMessageVisible = false;
        this.animTimeout = setTimeout(() => this.moveToNextUni(), 600);
      }, 3000);
    }, 1600);
  }
  // ───────────────────────────────────────────────────────────────────────

  showAuthModal = false;

  openAuthModal(form: 'login' | 'register'): void {
    this.activeForm = form;
    this.showAuthModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
    document.body.style.overflow = '';
    this.errorMsg = [];
    this.errorMsgReg = [];
    this.errorMsgInternal = [];
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
    this.showSuccessMessage=false;
  }
}
