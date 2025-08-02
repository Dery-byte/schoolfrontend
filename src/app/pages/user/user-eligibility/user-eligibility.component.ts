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



// downloadAsPdf(result: EligibilityResult): void {
//   const doc = new jsPDF();
//     // Set document properties
//   doc.setProperties({
//     title: `Eligibility Analysis - ${result.id}`,
//     subject: 'University Admission Eligibility Report',
//     author: 'Admission Analysis System',
//     keywords: 'university, admission, eligibility',
//     creator: 'Edu App'
//   });

//   // Add title
//   doc.setFontSize(20);
//   doc.setTextColor(40, 53, 147);
//   doc.text('University Admission Eligibility Report', 105, 20, { align: 'center' });

//   // Add subtitle
//   doc.setFontSize(12);
//   doc.setTextColor(81, 81, 81);
//   doc.text(`Analysis ID: ${result.id}`, 105, 30, { align: 'center' });
//   doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });

//   // Add candidate info if available
//   if (result.examCheckRecord?.candidateName) {
//     doc.setFontSize(14);
//     doc.setTextColor(0, 0, 0);
//     doc.text(`Candidate: ${result.examCheckRecord.candidateName}`, 14, 50);
//   }

//   // Add summary section
//   doc.setFontSize(12);
//   doc.setTextColor(0, 0, 0);
//   doc.text('Summary', 14, 60);
  
//   // Draw summary table
//   autoTable(doc, {
//     startY: 65,
//     head: [['Metric', 'Count']],
//     body: [
//       ['Total Universities', result.universities.length.toString()],
//       ['Eligible Programs', this.getTotalEligiblePrograms(result).toString()],
//       ['Alternative Programs', this.getTotalAlternativePrograms(result).toString()],
//       ['Created Date', new Date(result.createdAt).toLocaleDateString()]
//     ],
//     theme: 'grid',
//     headStyles: {
//       fillColor: [40, 53, 147],
//       textColor: 255
//     }
//   });

//   let yPosition = (doc as any).lastAutoTable.finalY + 15;
  
//   result.universities.forEach((university, index) => {
//     // Add university header
//     doc.setFontSize(14);
//     doc.setTextColor(40, 53, 147);
//     doc.text(`${university.universityName} (${university.location})`, 14, yPosition);
//     yPosition += 10;
    
//     // Add university type
//     doc.setFontSize(12);
//     doc.setTextColor(81, 81, 81);
//     doc.text(`Type: ${university.type}`, 14, yPosition);
//     yPosition += 10;
    
//     // Add eligible programs if any
//     if (university.eligiblePrograms.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(0, 100, 0);
//       doc.text('Eligible Programs:', 14, yPosition);
//       yPosition += 7;
      
//       const eligibleProgramsData = university.eligiblePrograms.map(program => [
//         program.name,
//         `${program.percentage}%`,
//         this.formatCutoffPoints(program.cutoffPoints)
//       ]);
      
//       autoTable(doc, {
//         startY: yPosition,
//         head: [['Program Name', 'Match %', 'Required Grades']],
//         body: eligibleProgramsData,
//         styles: {
//           cellPadding: 3,
//           fontSize: 10,
//           valign: 'middle'
//         },
//         columnStyles: {
//           0: { cellWidth: 60 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 'auto' }
//         },
//         headStyles: {
//           fillColor: [0, 100, 0],
//           textColor: 255
//         },
//         didParseCell: (data) => {
//           if (data.section === 'body') {
//             data.row.height = 20; // Increase row height for better readability
//           }
//         }
//       });
      
//       yPosition = (doc as any).lastAutoTable.finalY + 10;
      
//       // Add AI recommendations for eligible programs
//       university.eligiblePrograms.forEach(program => {
//         if (program.aiRecommendation) {
//           yPosition = this.addAiRecommendationToPdf(doc, program, yPosition);
          
//           // Add page break if needed
//           if (yPosition > 250) {
//             doc.addPage();
//             yPosition = 20;
//           }
//         }
//       });
//     }
    
//     // Add alternative programs if any
//     if (university.alternativePrograms.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(205, 147, 0);
//       doc.text('Alternative Programs:', 14, yPosition);
//       yPosition += 7;
      
//       const alternativeProgramsData = university.alternativePrograms.map(program => [
//         program.name,
//         `${program.percentage}%`,
//         this.formatCutoffPoints(program.cutoffPoints),
//         program.explanations?.join('\n') || 'N/A'
//       ]);
      
//       autoTable(doc, {
//         startY: yPosition,
//         // head: [['Program Name', 'Match %', 'Required Grades', 'Notes']],
//         head: [['Program Name', 'Match %', 'Required Grades']],
//         body: alternativeProgramsData,
//         styles: {
//           cellPadding: 3,
//           fontSize: 10,
//           valign: 'middle'
//         },
//         columnStyles: {
//           0: { cellWidth: 60 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 'auto' }
//           // 0: { cellWidth: 50 },
//           // 1: { cellWidth: 20 },
//           // 2: { cellWidth: 40 },
//           // 3: { cellWidth: 'auto' }
//         },
//         headStyles: {
//           fillColor: [205, 147, 0],
//           textColor: 255
//         },
//         didDrawCell: (data: any) => {
//           if (data.column.index === 3) {
//             doc.setFillColor(255, 255, 200);
//             doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
//           }
//         },
//         didParseCell: (data) => {
//           if (data.section === 'body') {
//             data.row.height = 20; // Increase row height for notes
//           }
//         }
//       });
      
//       yPosition = (doc as any).lastAutoTable.finalY + 10;
      
//       // Add AI recommendations for alternative programs
//       university.alternativePrograms.forEach(program => {
//         if (program.aiRecommendation) {
//           yPosition = this.addAiRecommendationToPdf(doc, program, yPosition);
          
//           // Add page break if needed
//           if (yPosition > 250) {
//             doc.addPage();
//             yPosition = 20;
//           }
//         }
//       });
//     }
    
//     // Add page break if needed between universities
//     if (yPosition > 250 && index < result.universities.length - 1) {
//       doc.addPage();
//       yPosition = 20;
//     }
//   });
  
//   // Add footer
//   const pageCount = doc.getNumberOfPages();
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);
//     doc.setFontSize(10);
//     doc.setTextColor(150);
//     doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
//     doc.text('By Edu App', 105, 290, { align: 'center' });
//   }
  
//   // Save the PDF
//   doc.save(`Eligibility_Report_${result.id}.pdf`);
// }

// private addAiRecommendationToPdf(doc: jsPDF, program: any, yPosition: number): number {
//   const aiRec = program.aiRecommendation;
//   if (!aiRec) return yPosition;
  
//   const leftMargin = 20;
//   const rightMargin = 190;
//   const lineHeight = 7;
//   const sectionGap = 5;
  
//   // Add Job Opportunities section
//   if (aiRec.jobOpportunities) {
//     doc.setFontSize(12);
//     doc.setTextColor(40, 53, 147); // Navy blue
//     doc.text('Job Opportunities:', leftMargin, yPosition);
//     yPosition += lineHeight;
    
//     doc.setFontSize(10);
//     doc.setTextColor(0, 0, 0); // Black
//     const jobText = this.stripHtml(aiRec.jobOpportunities);
//     const jobLines = doc.splitTextToSize(jobText, rightMargin - leftMargin);
//     doc.text(jobLines, leftMargin + 5, yPosition);
//     yPosition += jobLines.length * lineHeight + sectionGap;
//   }
  
//   // Add Career Path section
//   if (aiRec.futureProspects) {
//     doc.setFontSize(12);
//     doc.setTextColor(40, 53, 147); // Navy blue
//     doc.text('Career Path:', leftMargin, yPosition);
//     yPosition += lineHeight;
    
//     doc.setFontSize(10);
//     doc.setTextColor(0, 0, 0); // Black
//     const careerText = this.stripHtml(aiRec.futureProspects);
//     const careerLines = doc.splitTextToSize(careerText, rightMargin - leftMargin);
//     doc.text(careerLines, leftMargin + 5, yPosition);
//     yPosition += careerLines.length * lineHeight + sectionGap;
//   }
  
//   return yPosition;
// }




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


























downloadAsPdf(result: EligibilityResult): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // Enhanced PDF Properties
  doc.setProperties({
    title: `Eligibility Assessment - ${result.id}`,
    subject: 'Comprehensive University Admission Analysis',
    author: 'EduVision Pro Analytics',
    keywords: 'university, admission, eligibility, analysis, higher education',
    creator: 'EduVision Pro'
  });

  // Professional Cover Header with Gradient Effect
  doc.setFillColor(15, 32, 82); // Deep Navy
  doc.rect(0, 0, 210, 50, 'F');
  
  // Header accent stripe
  doc.setFillColor(0, 123, 191); // Professional Blue
  doc.rect(0, 42, 210, 8, 'F');

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ADMISSION ELIGIBILITY', 105, 22, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(200, 220, 240);
  doc.text('COMPREHENSIVE ANALYSIS REPORT', 105, 32, { align: 'center' });

  // Enhanced Candidate Information Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 230, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, 60, 160, 45, 8, 8, 'FD');
  
  // Inner accent
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(30, 65, 150, 35, 5, 5, 'F');

  doc.setFontSize(12);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', 105, 75, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 123, 191);
  doc.text(result.examCheckRecord?.id || 'Candidate', 105, 85, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${result.id}`, 105, 92, { align: 'center' });
  doc.text(`Generated: ${formattedDate}`, 105, 97, { align: 'center' });

  // EXECUTIVE SUMMARY with Enhanced Styling
  let y = 115;

  doc.setFontSize(18);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, y);
  
  // Professional underline with gradient effect
  doc.setDrawColor(0, 123, 191);
  doc.setLineWidth(2);
  doc.line(20, y + 2, 75, y + 2);
  doc.setDrawColor(200, 220, 240);
  doc.setLineWidth(0.5);
  doc.line(20, y + 4, 75, y + 4);

  // Enhanced Summary Table
  autoTable(doc, {
    startY: y + 12,
    head: [['Key Metrics', 'Results']],
    body: [
      ['Total Universities Analyzed', result.universities.length.toString()],
      ['Highly Eligible Programs', this.getTotalEligiblePrograms(result).toString()],
      ['Alternative Options', this.getTotalAlternativePrograms(result).toString()],
      ['Analysis Date', new Date(result.createdAt).toLocaleDateString()],
    ],
    styles: { 
      fontSize: 11, 
      cellPadding: 4, 
      halign: 'left',
      lineColor: [220, 230, 240],
      lineWidth: 0.3
    },
    headStyles: { 
      fillColor: [15, 32, 82], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 32, 82] },
      1: { textColor: [0, 123, 191], fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto'
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // University Analysis Section Header
  doc.setFontSize(18);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed University Analysis', 20, y);
  
  doc.setDrawColor(0, 123, 191);
  doc.setLineWidth(2);
  doc.line(20, y + 2, 100, y + 2);
  y += 15;

  for (let i = 0; i < result.universities.length; i++) {
    const university = result.universities[i];
    const estimatedHeight = 25 + (university.eligiblePrograms?.length ?? 0 + university.alternativePrograms?.length ?? 0) * 50;
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y + estimatedHeight > pageHeight - 30) {
      doc.addPage();
      this.addCorporateHeader(doc);
      y = 35;
    }

    // Enhanced University Title Card
    doc.setFillColor(15, 32, 82);
    doc.roundedRect(20, y, 170, 12, 4, 4, 'F');
    
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(university.universityName.toUpperCase(), 25, y + 8);
    y += 17;

    // University Details with Icons (represented by bullets)
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Type: ${university.type}`, 25, y);
    doc.text(`• Location: ${university.location}`, 90, y);
    y += 8;

    // Eligible Programs
    if (university.eligiblePrograms?.length) {
      y = this.addProgramsWithInsights(doc, university.eligiblePrograms, 'Highly Eligible Programs', [34, 139, 34], y, 'Eligible');
    }

    // Alternative Programs
    if (university.alternativePrograms?.length) {
      y = this.addProgramsWithInsights(doc, university.alternativePrograms, 'Alternative Programs', [191, 87, 0], y, 'Alternative');
    }

    y += 8;
  }

  // Enhanced Recommendation Page
  doc.addPage();
  this.addCorporateHeader(doc);
  
  doc.setFontSize(20);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Admission Strategy Recommendations', 20, 40);
  
  doc.setDrawColor(0, 123, 191);
  doc.setLineWidth(2);
  doc.line(20, 43, 130, 43);

  // Professional Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 270, 210, 27, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('This report was generated by EduVision Pro Analytics Engine', 105, 280, { align: 'center' });
  doc.setTextColor(0, 123, 191);
  doc.text('For questions, contact: admissions@eduvisionpro.com', 105, 285, { align: 'center' });

  // Enhanced Footer with Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${totalPages}`, 190, 290, { align: 'right' });
  }

  const safeName = result.examCheckRecord?.candidateName?.replace(/\s+/g, '_') || 'Candidate';
  doc.save(`Eligibility_Assessment_${safeName}_${Date.now()}.pdf`);
}

private addProgramsWithInsights(
  doc: jsPDF,
  programs: any[],
  sectionTitle: string,
  color: [number, number, number],
  startY: number,
  categoryLabel: 'Eligible' | 'Alternative'
): number {
  let y = startY;

  // Enhanced Section Header
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(20, y, 170, 10, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sectionTitle}`, 25, y + 7);
  y += 15;

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];

    // Enhanced Program Table
    autoTable(doc, {
      startY: y,
      head: [['Program Name', 'Match Score', 'Cutoff Points']],
      body: [[
        program.name || 'Unknown Program',
        `${program.percentage ?? 0}%`,
        this.formatCutoffPoints(program.cutoffPoints)
      ]],
      styles: { 
        fontSize: 11, 
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.3
      },
      headStyles: { 
        fillColor: color, 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 32, 82] },
        1: { textColor: color, fontStyle: 'bold', halign: 'center' },
        2: { textColor: [80, 80, 80], halign: 'center' }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto'
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    // Enhanced Category Badge
    const badgeColor = categoryLabel === 'Eligible' ? [34, 139, 34] : [191, 87, 0];
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(22, y, 25, 6, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryLabel, 34.5, y + 4, { align: 'center' });

    // Domain/Categories with enhanced styling
    if (program.categories?.length) {
      doc.setFillColor(240, 248, 255);
      const domainText = `Domain: ${program.categories.join(', ')}`;
      const textWidth = doc.getTextWidth(domainText) + 8;
      doc.roundedRect(50, y, textWidth, 6, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(0, 123, 191);
      doc.setFont('helvetica', 'normal');
      doc.text(domainText, 54, y + 4);
    }
    
    y += 10;

    // Enhanced AI Recommendations
    if (program.aiRecommendation) {
      y = this.addAIInsights(doc, program, y);
    }

    y += 8;

    // Handle pagination
    if (y > 240 && i < programs.length - 1) {
      doc.addPage();
      this.addCorporateHeader(doc);
      y = 35;
    }
  }

  return y;
}

private addAIInsights(doc: jsPDF, program: any, startY: number): number {
  let y = startY;
  const ai = program.aiRecommendation;

  // Enhanced AI Insights Header
  doc.setFillColor(15, 32, 82);
  doc.roundedRect(25, y, 165, 12, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`🎯 Career Insights: ${program.name}`, 30, y + 8);
  y += 18;

  const lineSpacing = 4;

  const addInsightBlock = (
    title: string, 
    content: string | undefined | null, 
    iconColor: [number, number, number],
    bgColor: [number, number, number]
  ): void => {
    if (!content || content.trim() === '') return;
    
    const clean = this.cleanAIText(content);
    const lines = doc.splitTextToSize(clean, 150);
    const blockHeight = 12 + (lines.length * lineSpacing) + 6;
    
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + blockHeight > pageHeight - 25) {
      doc.addPage();
      this.addCorporateHeader(doc);
      y = 35;
    }

    // Enhanced insight block with colored background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(30, y, 155, blockHeight, 3, 3, 'F');
    
    // Left colored accent bar
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.roundedRect(30, y, 4, blockHeight, 2, 2, 'F');

    // Title with icon styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.text(title, 38, y + 8);
    
    y += 12;

    // Content with enhanced readability
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    for (const line of lines) {
      doc.text(line, 38, y);
      y += lineSpacing;
    }
    
    y += 6;
  };

  // Enhanced insight blocks with distinct colors
  addInsightBlock('🚀 Career Path', ai.careerPath, [34, 139, 34], [248, 255, 248]);
  addInsightBlock('💼 Job Opportunities', ai.jobOpportunities, [0, 123, 191], [240, 248, 255]);
  addInsightBlock('🔮 Future Prospects', ai.futureProspects, [138, 43, 226], [248, 245, 255]);

  // Professional separator
  doc.setDrawColor(220, 230, 240);
  doc.setLineWidth(0.5);
  doc.line(25, y, 190, y);
  y += 5;

  return y;
}

private cleanAIText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[-•*]\s*/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

private addCorporateHeader(doc: jsPDF): void {
  const title = 'University Eligibility Report';
  const subtitle = 'Generated by EduMatch AI – Tailored Pathways to Your Future';

  // Enhanced header background
  doc.setFillColor(250, 251, 252);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Accent stripe
  doc.setFillColor(0, 123, 191);
  doc.rect(0, 26, 210, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 32, 82);
  doc.text(title, 20, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 20, 21);

  // Page number with enhanced styling
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(175, 8, 25, 8, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(0, 123, 191);
  doc.setFont('helvetica', 'bold');
  doc.text(`Page ${doc.getNumberOfPages()}`, 187.5, 13, { align: 'center' });
}
}
