import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/services/authentication.service';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-user-reports',
  templateUrl: './admin-user-reports.component.html',
  styleUrls: ['./admin-user-reports.component.css']
})
export class AdminUserReportsComponent implements OnInit {
  userReports: any[] = [];
  loading = true;
  downloadingId: string | null = null;

  constructor(
    private authService: AuthenticationService,
    private manualService: ManaulServiceService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUserReports();
  }

  loadUserReports() {
    this.loading = true;
    this.authService.getAllUsersWithReports().subscribe({
      next: (data) => {
        this.userReports = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user reports:', err);
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  downloadReport(reportId: string): void {
    this.downloadingId = reportId;
    this.manualService.adminDownloadReport(reportId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Eligibility_Report_${reportId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: (err) => {
        console.error('Download failed:', err);
        this.snackBar.open('Failed to download report. Please try again.', 'Dismiss', { duration: 4000 });
        this.downloadingId = null;
      }
    });
  }

  deleteReport(userRecord: any, reportId: string): void {
    if (!confirm('Are you sure you want to delete this eligibility report?')) return;

    this.manualService.deleteEligibilityReport(reportId).subscribe({
      next: () => {
        this.snackBar.open('Report deleted successfully.', 'Dismiss', { duration: 3000 });
        // Remove the report from the UI
        if (userRecord && userRecord.reports) {
          userRecord.reports = userRecord.reports.filter((r: any) => r.id !== reportId);
        }
      },
      error: (err) => {
        console.error('Failed to delete report:', err);
        this.snackBar.open('Failed to delete report.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
