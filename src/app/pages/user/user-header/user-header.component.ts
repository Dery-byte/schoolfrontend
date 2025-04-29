import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthenticationService } from 'src/app/services/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent {

    
    userName: string | null = null;
    roles:any[]=[];
    users:any;
  
  
      constructor(private authenticationService: AuthenticationService,
        private authService:AuthService,
            private router: Router,
        
      ) {
        
      }
    ngOnInit() {
  
      this.authService.user$.subscribe(user => {
        this.userName = user;
      });
      // Load user from local storage on refresh
      // this.userName = this.authService.getUser();
  this.authService.initializeUserFromToken();
  
    }
  
  
    logout() {
      this.userName = null;
      localStorage.removeItem('token');
      this.authService.logout();
    
      this.router.navigate(['/']).then(() => {
        window.location.reload(); // optional — only if you need a full reload
      });
    }
    
  
  

}
