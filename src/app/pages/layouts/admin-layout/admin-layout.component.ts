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
      "assets/admin/assets/js/plugin/webfont/webfont.min.js"
    ];

    for (const src of scripts) {
      // Skip if already in the DOM — prevents duplicate injection when Angular
      // re-mounts this layout on navigation, which caused the jQuery scrollbar
      // plugin to re-run and block native page scroll.
      if (document.querySelector(`script[src="${src}"]`)) {
        continue;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
    }
  }


}
