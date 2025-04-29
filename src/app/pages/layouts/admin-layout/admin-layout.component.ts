import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {


  
  ngOnInit(): void {
    this.loadScripts();
  }





  loadScripts() {
    const scripts = [
 "assets/admin/assets/js/core/jquery-3.7.1.min.js",
"assets/admin/assets/js/core/popper.min.js",
"assets/admin/assets/js/core/bootstrap.min.js",
"assets/admin/assets/js/plugin/jquery-scrollbar/jquery.scrollbar.min.js",
"assets/admin/assets/js/plugin/chart.js/chart.min.js",
"assets/admin/assets/js/plugin/jquery.sparkline/jquery.sparkline.min.js",
"assets/admin/assets/js/plugin/chart-circle/circles.min.js",
"assets/admin/assets/js/plugin/datatables/datatables.min.js",
"assets/admin/assets/js/plugin/bootstrap-notify/bootstrap-notify.min.js",
"assets/admin/assets/js/plugin/jsvectormap/jsvectormap.min.js",
"assets/admin/assets/js/plugin/jsvectormap/world.js",
"assets/admin/assets/js/plugin/sweetalert/sweetalert.min.js",
"assets/admin/assets/js/kaiadmin.min.js",
"assets/admin/assets/js/setting-demo.js",
"assets/admin/assets/js/demo.js",
"assets/admin/js/plugin/webfont/webfont.min.js"

    ];
  
    for (let script of scripts) {
      const s = document.createElement('script');
      s.src = script;
      s.async = false;
      document.body.appendChild(s);
    }
  }


}
