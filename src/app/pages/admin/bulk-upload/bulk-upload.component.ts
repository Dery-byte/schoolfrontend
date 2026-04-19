import { Component } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';

interface PreviewProgram {
  name: string;
  coreCount: number;
  altGroupCount: number;
}

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {
  fileName = '';
  parsedData: any = null;
  previewPrograms: PreviewProgram[] = [];
  parseError = '';
  universityName = '';
  universityLoading = false;

  isUploading = false;
  result: any = null;
  uploadError = '';

  constructor(private manualService: ManaulServiceService) {}

  onFileSelected(event: Event): void {
    this.parsedData = null;
    this.previewPrograms = [];
    this.parseError = '';
    this.result = null;
    this.uploadError = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!json.universityId || !Array.isArray(json.programs)) {
          this.parseError = 'Invalid file: must contain "universityId" and "programs" array.';
          return;
        }

        this.parsedData = json;
        this.previewPrograms = json.programs.map((p: any) => ({
          name: p.name || '(unnamed)',
          coreCount: Object.keys(p.coreSubjects || {}).length,
          altGroupCount: (p.alternativeGroups || []).length,
        }));

        this.universityName = '';
        this.universityLoading = true;
        this.manualService.getUniversityById(json.universityId).subscribe({
          next: (uni: any) => {
            this.universityLoading = false;
            this.universityName = uni?.name || `ID ${json.universityId}`;
          },
          error: () => {
            this.universityLoading = false;
            this.universityName = `Unknown (ID ${json.universityId})`;
          }
        });
      } catch {
        this.parseError = 'Could not parse file — make sure it is valid JSON.';
      }
    };
    reader.readAsText(file);
  }

  upload(): void {
    if (!this.parsedData) return;

    this.isUploading = true;
    this.result = null;
    this.uploadError = '';

    this.manualService.bulkImportPrograms(this.parsedData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        this.result = res;
      },
      error: (err: any) => {
        this.isUploading = false;
        this.uploadError = err?.error?.message || err?.message || 'Upload failed. Please try again.';
      }
    });
  }

  reset(): void {
    this.fileName = '';
    this.parsedData = null;
    this.previewPrograms = [];
    this.parseError = '';
    this.result = null;
    this.uploadError = '';
    this.universityName = '';
    this.universityLoading = false;
  }
}
