import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/services/authentication.service';
import {skipUntil} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent {
  
  
  message = '';
  isOkay = true;
  submitted = false;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private auth:AuthService
  ) {}

  ngOnInit(){
    this.auth.setComingFromRegistration(false);

  }


  ngAfterViewInit() {
    // Delay to ensure inputs are rendered
    setTimeout(() => {
      const firstInput = document.querySelector('code-input input');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    });
  }

  private confirmAccount(token: string) {
    this.authService.confirm({
      token
    }).subscribe({
      next: () => {
        this.message = 'Your account has been successfully activated.\n Proceed to login';
        this.submitted = true;
        this.isOkay=true;
      },
      error: () => {
        this.message = 'Token has expired or invalid! A new token has been sent.';
        this.submitted = true;
        this.isOkay = false;
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['/']);
  }

  onCodeCompleted(token: string) {
    // this.codeValue = token;
    // this.isCodeComplete = token.length === 6; // Update this length if different
    this.confirmAccount(token);
    
  }

  protected readonly skipUntil = skipUntil;

}
