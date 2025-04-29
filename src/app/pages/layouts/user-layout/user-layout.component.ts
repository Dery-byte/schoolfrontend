import { Component } from '@angular/core';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {

  
  ngOnInit(): void {
    this.loadScripts();
  }





  loadScripts() {
    const scripts = [
 "assets/user/assets/libs/jquery/jquery.min.js",
"assets/user/assets/libs/bootstrap/js/bootstrap.bundle.min.js",
"assets/user/assets/libs/metismenu/metisMenu.min.js",
"assets/user/assets/libs/simplebar/simplebar.min.js",
"assets/user/assets/libs/node-waves/waves.min.js",
"assets/user/assets/libs/apexcharts/apexcharts.min.js",
"assets/user/assets/js/pages/dashboard.init.js",
"assets/user/assets/js/app.js",

    ];
  
    for (let script of scripts) {
      const s = document.createElement('script');
      s.src = script;
      s.async = false;
      document.body.appendChild(s);
    }
  }


}
