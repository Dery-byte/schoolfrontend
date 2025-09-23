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
  
  















     message = '';
  messageType = '';
  debugInfo = '';

  // Create and download a test file to verify download functionality
  createAndDownloadTestFile() {
    const testContent = 'This is a test file to verify download functionality works.';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-file.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    this.message = 'Test file created and downloaded successfully!';
    this.messageType = 'success';
  }

  // Test the actual PDF download
  async downloadExistingPDF() {
    const pdfPath = 'assets/sample/sample_elgibility.pdf';
    
    try {
      this.debugInfo = 'Starting PDF download test...\n';
      
      const response = await fetch(pdfPath);
      this.debugInfo += `Response status: ${response.status}\n`;
//      this.debugInfo += `Response headers: ${JSON.stringify(Array.from(response.headers.entries()), null, 2)}\n`;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      this.debugInfo += `Blob size: ${blob.size} bytes\n`;
      this.debugInfo += `Blob type: ${blob.type}\n`;
      
      if (blob.size === 0) {
        this.message = 'PDF file is empty (0 bytes)';
        this.messageType = 'error';
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sample_elgibility.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.message = `PDF downloaded successfully! Size: ${blob.size} bytes`;
      this.messageType = 'success';
      
    } catch (error: any) {
      this.message = `Download failed: ${error.message}`;
      this.messageType = 'error';
      this.debugInfo += `Error: ${error.message}\n`;
    }
  }

  openPdfInNewTab(){
    
  }
}
