import { Component, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
    private router: Router
  ) {}

  closeSidebar(): void {
    const body = this.document.body;

    if (body.classList.contains('nav_open')) {
      this.renderer.removeClass(body, 'nav_open');
    }

    const toggleButton = this.document.querySelector('.sidenav-toggler') as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('auth_token');
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }
}
