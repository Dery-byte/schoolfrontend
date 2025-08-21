import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import player from 'lottie-web';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthenticationService } from 'src/app/services/services';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent {
  profileCompletion = 85;

  steps = [
    {
      animation: 'assets/animations/complete-profile.json',
      title: 'Complete Your Profile',
      description: 'Build your academic profile by entering your subjects, grades, and program preferences for accurate matching.',
      linkText: 'Get started'
    },
    {
      animation: 'assets/animations/ai-matching.json',
      title: 'AI-Powered Matching',
      description: 'Our algorithm analyzes your profile against thousands of institutions to find perfect academic matches.',
      linkText: 'Learn more'
    },
    {
      animation: 'assets/animations/results.json',
      title: 'Personalized Results',
      description: 'Receive tailored recommendations with acceptance probabilities and scholarship opportunities.',
      linkText: 'View example'
    }
  ];

  stats = [
    { label: 'Institutions', value: '2,400+' },
    { label: 'Success Rate', value: '94%' },
    { label: 'Scholarships', value: '$18M+' },
    { label: 'Avg. Time Saved', value: '120h' }
  ];

 




    userName: string | null = null;
    roles: any[] = [];
    users: any;
  
  
    constructor(private authenticationService: AuthenticationService,
      private authService: AuthService,
      private router: Router,
  
    ) {
  
    }
    ngOnInit() {
  
      this.authService.user$.subscribe(fullName => {
        this.userName = fullName;
        console.log(fullName);
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
