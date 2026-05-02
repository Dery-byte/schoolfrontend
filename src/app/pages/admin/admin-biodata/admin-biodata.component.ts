import { Component, OnInit } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-biodata',
  templateUrl: './admin-biodata.component.html',
  styleUrls: ['./admin-biodata.component.css']
})
export class AdminBiodataComponent implements OnInit {
  biodataList: any[] = [];
  loading = true;
  downloadingId: string | null = null;

  // Email compose state
  emailPanelOpen: { [biodataId: number]: boolean } = {};
  emailForm: { [biodataId: number]: { subject: string; body: string } } = {};
  sendingEmail: { [biodataId: number]: boolean } = {};

  constructor(
    private manualService: ManaulServiceService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBiodata();
  }

  loadBiodata(): void {
    this.loading = true;
    this.manualService.getAllBiodataWithReportStatus().subscribe({
      next: (data) => {
        this.biodataList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching biodata:', err);
        this.snackBar.open('Failed to load biodata records.', 'Dismiss', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  downloadReport(eligibilityRecordId: string): void {
    this.downloadingId = eligibilityRecordId;
    this.manualService.adminDownloadReport(eligibilityRecordId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Eligibility_Report_${eligibilityRecordId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: (err) => {
        console.error('Download failed:', err);
        this.snackBar.open('Failed to download report.', 'Dismiss', { duration: 4000 });
        this.downloadingId = null;
      }
    });
  }

  toggleEmailPanel(biodataId: number): void {
    this.emailPanelOpen[biodataId] = !this.emailPanelOpen[biodataId];
    if (!this.emailForm[biodataId]) {
      this.emailForm[biodataId] = { subject: '', body: '' };
    }
  }

  sendEmail(bio: any): void {
    const form = this.emailForm[bio.id];
    if (!form || !form.subject.trim() || !form.body.trim()) {
      this.snackBar.open('Please fill in both Subject and Message Body.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.sendingEmail[bio.id] = true;
    this.manualService.sendAdminEmail({
      toEmail: bio.email,
      recipientName: bio.firstName + ' ' + bio.lastName,
      subject: form.subject,
      messageBody: form.body
    }).subscribe({
      next: () => {
        this.snackBar.open(`✅ Email sent to ${bio.email}`, 'Dismiss', { duration: 4000 });
        this.sendingEmail[bio.id] = false;
        this.emailPanelOpen[bio.id] = false;
        this.emailForm[bio.id] = { subject: '', body: '' };
      },
      error: (err) => {
        console.error('Email send failed:', err);
        this.snackBar.open('Failed to send email. Please try again.', 'Dismiss', { duration: 4000 });
        this.sendingEmail[bio.id] = false;
      }
    });
  }
}
