import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  threshold: number = 3;
  discountMode: string = 'MANUAL';
  
  loading: boolean = false;
  saving: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadThreshold();
  }

  loadThreshold(): void {
    this.loading = true;
    this.http.get<any>('http://localhost:8088/api/v1/auth/admin/settings/threshold').subscribe({
      next: (res) => {
        this.threshold = res.threshold;
        this.discountMode = res.discountMode || 'MANUAL';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading threshold', err);
        this.loading = false;
      }
    });
  }

  saveThreshold(): void {
    this.saving = true;
    const payload = {
      threshold: this.threshold,
      discountMode: this.discountMode
    };
    
    this.http.post<any>('http://localhost:8088/api/v1/auth/admin/settings/threshold', payload).subscribe({
      next: (res) => {
        alert(res.message);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving threshold', err);
        alert('Failed to save threshold');
        this.saving = false;
      }
    });
  }
}
