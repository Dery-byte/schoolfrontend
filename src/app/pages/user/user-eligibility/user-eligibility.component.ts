import { Component, Input } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { EligibilityResult } from 'src/app/customModels/eligibility.model';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-user-eligibility',
  templateUrl: './user-eligibility.component.html',
  styleUrls: ['./user-eligibility.component.css']
})
export class UserEligibilityComponent {
@Input() records: EligibilityResult[] = [];
  expandedResultId: string | null = null;
  selectedResult: EligibilityResult | null = null;
  showModal = false;
   isLoading = false;
  loadingError = false;
  constructor(  private manualService: ManaulServiceService,    private snackBar: MatSnackBar
){ 
  }

    ngOnInit(): void {
      this.recordByUser();
  }



  // records:any;
  recordByUser(){
    this.isLoading = true;
    this.loadingError = false;
  this.manualService.eligibilityRecordsByUser().subscribe({
    next: (data: any) => {
      this.records = data;
      this.isLoading = false;
    },
    error: (err) => {
          this.loadingError = true;
        this.isLoading = false;
        this.snackBar.open('Failed to load results', 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      
      console.error('Fetching Records!!!:', err);
    }
  });
  }


 getSubjects(cutoffPoints: { [subject: string]: string }): string[] {
    return Object.keys(cutoffPoints);
  }


  toggleExpand(resultId: string): void {
    this.expandedResultId = this.expandedResultId === resultId ? null : resultId;
  }

  openPreview(result: EligibilityResult): void {
    this.selectedResult = result;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  downloadAsJson(result: EligibilityResult): void {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    this.triggerDownload(dataUri, `${result.id}.json`);
  }

  // downloadAsPdf(result: EligibilityResult): void {
  //   // In a real implementation, you would use a PDF generation library like jsPDF
  //   console.log('PDF generation would happen here for result:', result.id);
  //   // This is a placeholder for actual PDF generation logic
  //   alert('PDF download functionality would be implemented here');
  // }

downloadAsPdf(result: EligibilityResult): void {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Eligibility Analysis - ${result.id}`,
    subject: 'University Admission Eligibility Report',
    author: 'Admission Analysis System',
    keywords: 'university, admission, eligibility',
    creator: 'Edu App'
  });

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40, 53, 147);
  doc.text('University Admission Eligibility Report', 105, 20, { align: 'center' });

  // Add subtitle
  doc.setFontSize(12);
  doc.setTextColor(81, 81, 81);
  doc.text(`Analysis ID: ${result.id}`, 105, 30, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });

  // Add candidate info if available
  if (result.examCheckRecord?.candidateName) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Candidate: ${result.examCheckRecord.candidateName}`, 14, 50);
  }

  // Add summary section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 14, 60);
  
  // Draw summary table
  autoTable(doc, {
    startY: 65,
    head: [['Metric', 'Count']],
    body: [
      ['Total Universities', result.universities.length.toString()],
      ['Eligible Programs', this.getTotalEligiblePrograms(result).toString()],
      ['Alternative Programs', this.getTotalAlternativePrograms(result).toString()],
      ['Created Date', new Date(result.createdAt).toLocaleDateString()]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [40, 53, 147],
      textColor: 255
    }
  });

  let yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  result.universities.forEach((university, index) => {
    // Add university header
    doc.setFontSize(14);
    doc.setTextColor(40, 53, 147);
    doc.text(`${university.universityName} (${university.location})`, 14, yPosition);
    yPosition += 10;
    
    // Add university type
    doc.setFontSize(12);
    doc.setTextColor(81, 81, 81);
    doc.text(`Type: ${university.type}`, 14, yPosition);
    yPosition += 10;
    
    // Add eligible programs if any
    if (university.eligiblePrograms.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      doc.text('Eligible Programs:', 14, yPosition);
      yPosition += 7;
      
      const eligibleProgramsData = university.eligiblePrograms.map(program => [
        program.name,
        `${program.percentage}%`,
        this.formatCutoffPoints(program.cutoffPoints)
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Program Name', 'Match %', 'Required Grades']],
        body: eligibleProgramsData,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 'auto' }
        },
        headStyles: {
          fillColor: [0, 100, 0],
          textColor: 255
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            data.row.height = 20; // Increase row height for better readability
          }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add AI recommendations for eligible programs
      university.eligiblePrograms.forEach(program => {
        if (program.aiRecommendation) {
          yPosition = this.addAiRecommendationToPdf(doc, program, yPosition);
          
          // Add page break if needed
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
    }
    
    // Add alternative programs if any
    if (university.alternativePrograms.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(205, 147, 0);
      doc.text('Alternative Programs:', 14, yPosition);
      yPosition += 7;
      
      const alternativeProgramsData = university.alternativePrograms.map(program => [
        program.name,
        `${program.percentage}%`,
        this.formatCutoffPoints(program.cutoffPoints),
        program.explanations?.join('\n') || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        // head: [['Program Name', 'Match %', 'Required Grades', 'Notes']],
        head: [['Program Name', 'Match %', 'Required Grades']],
        body: alternativeProgramsData,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 'auto' }
          // 0: { cellWidth: 50 },
          // 1: { cellWidth: 20 },
          // 2: { cellWidth: 40 },
          // 3: { cellWidth: 'auto' }
        },
        headStyles: {
          fillColor: [205, 147, 0],
          textColor: 255
        },
        didDrawCell: (data: any) => {
          if (data.column.index === 3) {
            doc.setFillColor(255, 255, 200);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            data.row.height = 20; // Increase row height for notes
          }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add AI recommendations for alternative programs
      university.alternativePrograms.forEach(program => {
        if (program.aiRecommendation) {
          yPosition = this.addAiRecommendationToPdf(doc, program, yPosition);
          
          // Add page break if needed
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
    }
    
    // Add page break if needed between universities
    if (yPosition > 250 && index < result.universities.length - 1) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('By Edu App', 105, 290, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`Eligibility_Report_${result.id}.pdf`);
}

private addAiRecommendationToPdf(doc: jsPDF, program: any, yPosition: number): number {
  const aiRec = program.aiRecommendation;
  if (!aiRec) return yPosition;
  
  const leftMargin = 20;
  const rightMargin = 190;
  const lineHeight = 7;
  const sectionGap = 5;
  
  // Add Job Opportunities section
  if (aiRec.jobOpportunities) {
    doc.setFontSize(12);
    doc.setTextColor(40, 53, 147); // Navy blue
    doc.text('Job Opportunities:', leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    const jobText = this.stripHtml(aiRec.jobOpportunities);
    const jobLines = doc.splitTextToSize(jobText, rightMargin - leftMargin);
    doc.text(jobLines, leftMargin + 5, yPosition);
    yPosition += jobLines.length * lineHeight + sectionGap;
  }
  
  // Add Career Path section
  // if (aiRec.futureProspects) {
  //   doc.setFontSize(12);
  //   doc.setTextColor(40, 53, 147); // Navy blue
  //   doc.text('Career Path:', leftMargin, yPosition);
  //   yPosition += lineHeight;
    
  //   doc.setFontSize(10);
  //   doc.setTextColor(0, 0, 0); // Black
  //   const careerText = this.stripHtml(aiRec.futureProspects);
  //   const careerLines = doc.splitTextToSize(careerText, rightMargin - leftMargin);
  //   doc.text(careerLines, leftMargin + 5, yPosition);
  //   yPosition += careerLines.length * lineHeight + sectionGap;
  // }
  
  return yPosition;
}

private stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '') // Remove HTML tags
             .replace(/&nbsp;/g, ' ') // Replace HTML spaces
             .replace(/\s+/g, ' ')    // Collapse multiple spaces
             .trim();
}

// private formatCutoffPoints(cutoffPoints: any): string {
//   return Object.entries(cutoffPoints)
//     .map(([subject, grade]) => `${subject}: ${grade}`)
//     .join('\n');
// }


















// Helper method to format cutoff points for display
private formatCutoffPoints(cutoffPoints: { [subject: string]: string }): string {
  return Object.entries(cutoffPoints)
    .map(([subject, grade]) => `${subject}: ${grade}`)
    .join('\n');
}

// Helper method to format cutoff points for display


  private triggerDownload(dataUri: string, fileName: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getTotalEligiblePrograms(result: EligibilityResult): number {
    return result.universities.reduce((sum, uni) => sum + uni.eligiblePrograms.length, 0);
  }

  getTotalAlternativePrograms(result: EligibilityResult): number {
    return result.universities.reduce((sum, uni) => sum + uni.alternativePrograms.length, 0);
  }

  getUniversityTypes(result: EligibilityResult): string[] {
    const types = new Set<string>();
    result.universities.forEach(uni => types.add(uni.type));
    return Array.from(types);
  }




  // eligibility-results.component.ts


// Check if any programs exist in a specific category
hasProgramsInCategory(programs: any[], category: string): boolean {
  if (!programs || !category) return false;
  return programs.some(program => 
    program.categories?.includes(category)
  );
}

// Filter programs by category
getProgramsByCategory(programs: any[], category: string): any[] {
  if (!programs || !category) return [];
  return programs.filter(program => 
    program.categories?.includes(category)
  );
}


}
