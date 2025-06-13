import { Component, Input } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { EligibilityResult } from 'src/app/customModels/eligibility.model';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';


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
  constructor(  private manualService: ManaulServiceService,){ 
  }

    ngOnInit(): void {
      this.recordByUser();
  }



  // records:any;
  recordByUser(){
  this.manualService.eligibilityRecordsByUser().subscribe({
    next: (data: any) => {
      this.records = data;
    },
    error: (err) => {
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
    creator: 'Admission Analysis System'
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
  
  // Draw summary table using autoTable function directly
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

  // Get the final Y position
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
      
      // Use autoTable function directly
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
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
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
      
      // Use autoTable function directly
      autoTable(doc, {
        startY: yPosition,
        head: [['Program Name', 'Match %', 'Required Grades', 'Notes']],
        body: alternativeProgramsData,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 20 },
          2: { cellWidth: 40 },
          3: { cellWidth: 'auto' }
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
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Add page break if needed
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
    doc.text('Generated by Admission Analysis System', 105, 290, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`Eligibility_Report_${result.id}.pdf`);
}


















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

}
