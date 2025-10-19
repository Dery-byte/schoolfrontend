import { Component, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
   constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}
closeSidebar() {
    // Log to see what's happening
    console.log('closeSidebar called');
    
    const body = this.document.body;
    const sidebar = this.document.querySelector('.sidebar') as HTMLElement;
    
    // Check current body classes
    console.log('Body classes:', body.className);
    
    // Try all possible methods to close sidebar
    
    // Method 1: Remove 'sidebar_minimize' class from body
    if (body.classList.contains('sidebar_minimize')) {
      this.renderer.removeClass(body, 'sidebar_minimize');
    }
    
    // Method 2: Add 'sidebar_minimize' class to body (some templates use this to hide)
    if (!body.classList.contains('sidebar_minimize')) {
      this.renderer.addClass(body, 'sidebar_minimize');
    }
    
    // Method 3: Toggle 'nav_open' class (common in mobile)
    if (body.classList.contains('nav_open')) {
      this.renderer.removeClass(body, 'nav_open');
    }
    
    // Method 4: Remove 'show' class from sidebar
    if (sidebar && sidebar.classList.contains('show')) {
      this.renderer.removeClass(sidebar, 'show');
    }
    
    // Method 5: Simulate toggle button click
    const toggleButton = this.document.querySelector('.toggle-sidebar') as HTMLElement;
    if (toggleButton) {
      console.log('Toggle button found, clicking...');
      toggleButton.click();
    }
    
    // Method 6: Try sidenav-toggler button
    const sidenavToggler = this.document.querySelector('.sidenav-toggler') as HTMLElement;
    if (sidenavToggler) {
      console.log('Sidenav toggler found, clicking...');
      sidenavToggler.click();
    }
  }
}
