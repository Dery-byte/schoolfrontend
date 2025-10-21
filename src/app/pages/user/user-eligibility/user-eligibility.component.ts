import { Component, Input } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { EligibilityResult } from 'src/app/customModels/eligibility.model';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';

// Types
type SectionKey = 'core' | 'alternative' | 'recommendations';

interface ParsedLine {
  status: 'pass' | 'fail' | 'excellent' | 'neutral';
  subject: string;
  requirement?: string;
  yourGrade?: string;
  remarks: string;
  originalLine: string;
}

interface RecommendationSections {
  core: ParsedLine[];
  alternative: ParsedLine[];
  recommendations: string[];
}


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


// Helper method to format cutoff points for display
// private formatCutoffPoints(cutoffPoints: { [subject: string]: string }): string {
//   return Object.entries(cutoffPoints)
//     .map(([subject, grade]) => `${subject}: ${grade}`)
//     .join('\n');
// }

// Helper method to format cutoff points for display

  private triggerDownload(dataUri: string, fileName: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // getTotalEligiblePrograms(result: EligibilityResult): number {
  //   return result.universities.reduce((sum, uni) => sum + uni.eligiblePrograms.length, 0);
  // }

  // getTotalAlternativePrograms(result: EligibilityResult): number {
  //   return result.universities.reduce((sum, uni) => sum + uni.alternativePrograms.length, 0);
  // }

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


























// downloadAsPdf(result: EligibilityResult): void {
//   const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//   const currentDate = new Date();
//   const formattedDate = currentDate.toLocaleString('en-US', {
//     year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
//   });

//   // Enhanced PDF Properties
//   doc.setProperties({
//     title: `Eligibility Assessment - ${result.id}`,
//     subject: 'Comprehensive University Admission Analysis',
//     author: 'EduVision Pro Analytics',
//     keywords: 'university, admission, eligibility, analysis, higher education',
//     creator: 'EduVision Pro'
//   });


//     const addFooter = () => {
//     doc.setFontSize(7);
//     doc.setTextColor(80, 80, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text('This report was generated by EduVision Pro Analytics Engine', 105, 280, { align: 'center' });
//     doc.setTextColor(0, 123, 191);
//     doc.text('For questions, contact: optimusinforservice@gmail.com', 105, 285, { align: 'center' });
//   };



//   // Professional Cover Header with Gradient Effect
//   doc.setFillColor(15, 32, 82); // Deep Navy
//   doc.rect(0, 0, 210, 50, 'F');
  
//   // Header accent stripe
//   //doc.setFillColor(0, 123, 191); // Professional Blue
//   doc.rect(0, 42, 210, 8, 'F');

//   doc.setFontSize(28);
//   doc.setTextColor(255, 255, 255);
//   doc.setFont('helvetica', 'bold');
//   doc.text('ADMISSION ELIGIBILITY', 105, 22, { align: 'center' });
//   doc.setFontSize(18);
//   doc.setTextColor(200, 220, 240);
//   doc.text('COMPREHENSIVE ANALYSIS REPORT', 105, 32, { align: 'center' });


  
//   // Inner accent
//   doc.setFillColor(240, 248, 255);
//   doc.roundedRect(30, 65, 150, 35, 5, 5, 'F');

//   doc.setFontSize(12);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');
//   doc.text('PREPARED FOR', 105, 75, { align: 'center' });
  
//   doc.setFontSize(18);
//   doc.setTextColor(0, 123, 191);
//   doc.text(result.examCheckRecord?.candidateName || 'Candidate', 105, 85, { align: 'center' });

//   doc.setFontSize(9);
//   doc.setTextColor(120, 120, 120);
//   doc.setFont('helvetica', 'normal');
//   doc.text(`Report ID: ${result.id}`, 105, 92, { align: 'center' });
//   doc.text(`Generated: ${formattedDate}`, 105, 97, { align: 'center' });

//   // EXECUTIVE SUMMARY with Enhanced Styling
//   let y = 115;

//   doc.setFontSize(18);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Executive Summary', 20, y);
  
//   // Professional underline with gradient effect
//   doc.setDrawColor(0, 123, 191);
//   doc.setLineWidth(1);
//   doc.line(20, y + 4, 75, y + 4);

//   // Enhanced Summary Table
//   autoTable(doc, {
//     startY: y + 12,
//     head: [['Key Metrics', 'Results']],
//     body: [
//       ['Total Universities Analyzed', result.universities.length.toString()],
//       ['Highly Eligible Programs', this.getTotalEligiblePrograms(result).toString()],
//       ['Alternative Options', this.getTotalAlternativePrograms(result).toString()],
//       ['Analysis Date', new Date(result.createdAt).toLocaleDateString()],
//     ],
//     styles: { 
//       fontSize: 11, 
//       cellPadding: 4, 
//       halign: 'left',
//       lineColor: [220, 230, 240],
//       lineWidth: 0.3
//     },
//     headStyles: { 
//       fillColor: [15, 32, 82], 
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       fontSize: 12
//     },
//     alternateRowStyles: { fillColor: [248, 250, 252] },
//     columnStyles: {
//       0: { fontStyle: 'bold', textColor: [15, 32, 82] },
//       1: { textColor: [0, 123, 191], fontStyle: 'bold' }
//     },
//     margin: { left: 20, right: 20 },
//     tableWidth: 'auto',
//      didDrawPage: function(data) {
//       // Add footer to every page
//       addFooter();
//      }
//   });

//   y = (doc as any).lastAutoTable.finalY + 15;

//   // University Analysis Section Header
//   doc.setFontSize(18);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Detailed University Analysis', 20, y);
  
//   doc.setDrawColor(0, 123, 191);
//   doc.setLineWidth(2);
//   doc.line(20, y + 2, 100, y + 2);
//   y += 15;

//   for (let i = 0; i < result.universities.length; i++) {
//     const university = result.universities[i];
//     const estimatedHeight = 25 + ((university.eligiblePrograms?.length ?? 0) + (university.alternativePrograms?.length ?? 0)) * 50;
//     // const estimatedHeight = 25 + (university.eligiblePrograms?.length ?? 0 + university.alternativePrograms?.length ?? 0) * 50;
//     const pageHeight = doc.internal.pageSize.getHeight();

//     if (y + estimatedHeight > pageHeight - 30) {
//       doc.addPage();
//       this.addCorporateHeader(doc);
//             addFooter();

//       y = 35;
//     }

//     // Enhanced University Title Card
//     doc.setFillColor(15, 32, 82);
//     doc.roundedRect(20, y, 170, 12, 4, 4, 'F');
    
//     doc.setFontSize(13);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont('helvetica', 'bold');
//     doc.text(university.universityName.toUpperCase(), 25, y + 8);
//     y += 17;

//     // University Details with Icons (represented by bullets)
//     doc.setFontSize(10);
//     doc.setTextColor(80, 80, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`• Type: ${university.type}`, 25, y);
//     doc.text(`• Location: ${university.location}`, 90, y);
//     y += 8;

//     // Eligible Programs
//     if (university.eligiblePrograms?.length) {
//       y = this.addProgramsWithInsights(doc, university.eligiblePrograms, 'Highly Eligible Programs', [34, 139, 34], y, 'Eligible');
//     }

//     // Alternative Programs
//     if (university.alternativePrograms?.length) {
//       y = this.addProgramsWithInsights(doc, university.alternativePrograms, 'Alternative Programs', [191, 87, 0], y, 'Alternative');
//     }

//     y += 8;
//   }

//   // Enhanced Recommendation Page
//   doc.addPage();
//   this.addCorporateHeader(doc);
//     addFooter();
  
//   doc.setFontSize(20);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');

//   doc.setFillColor(248, 250, 252);
//   doc.rect(0, 270, 210, 27, 'F');
  
//   doc.setFontSize(7);
//   doc.setTextColor(80, 80, 80);
//   doc.setFont('helvetica', 'normal');
//   doc.text('This report was generated by EduVision Pro Analytics Engine', 105, 280, { align: 'center' });
//   doc.setTextColor(0, 123, 191);
//   doc.text('For questions, contact: optimusinforservice@gmail.com', 105, 285, { align: 'center' });

//   // Enhanced Footer with Page Numbers
//   const totalPages = doc.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFontSize(9);
//     doc.setTextColor(120, 120, 120);
//     doc.text(`Page ${i} of ${totalPages}`, 190, 290, { align: 'right' });
//   }

//   const safeName = result.examCheckRecord?.candidateName?.replace(/\s+/g, '_') || 'Candidate';
//   doc.save(`Eligibility_Assessment_${safeName}_${Date.now()}.pdf`);
// }

// private addProgramsWithInsights(
//   doc: jsPDF,
//   programs: any[],
//   sectionTitle: string,
//   color: [number, number, number],
//   startY: number,
//   categoryLabel: 'Eligible' | 'Alternative'
// ): number {
//   let y = startY;

//   // Enhanced Section Header
//   doc.setFillColor(color[0], color[1], color[2]);
//   doc.roundedRect(20, y, 170, 10, 3, 3, 'F');
  
//   doc.setFontSize(12);
//   doc.setTextColor(255, 255, 255);
//   doc.setFont('helvetica', 'bold');
//   doc.text(`${sectionTitle}`, 25, y + 7);
//   y += 15;

//   for (let i = 0; i < programs.length; i++) {
//     const program = programs[i];

//     // Enhanced Program Table
//     autoTable(doc, {
//       startY: y,
//       head: [['Program Name', 'Match Score', 'Cutoff Points']],
//       body: [[
//         program.name || 'Unknown Program',
//         `${(program.percentage ?? 0).toFixed(1)}%`,
//         // `${program.percentage ?? 0}%`,
//         this.formatCutoffPoints(program.cutoffPoints)
//       ]],
//       styles: { 
//         fontSize: 11, 
//         cellPadding: 5,
//         lineColor: [220, 220, 220],
//         lineWidth: 0.3
//       },
//       headStyles: { 
//         fillColor: color, 
//         textColor: [255, 255, 255], 
//         fontStyle: 'bold',
//         fontSize: 12
//       },
//       bodyStyles: {
//         textColor: [50, 50, 50]
//       },
//       columnStyles: {
//         0: { fontStyle: 'bold', textColor: [15, 32, 82] },
//         1: { textColor: color, fontStyle: 'bold', halign: 'center' },
//         2: { textColor: [80, 80, 80], halign: 'center' }
//       },
//       margin: { left: 20, right: 20 },
//       tableWidth: 'auto'
//     });

//     y = (doc as any).lastAutoTable.finalY + 3;

//     // Enhanced Category Badge
//     const badgeColor = categoryLabel === 'Eligible' ? [34, 139, 34] : [191, 87, 0];
//     doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
//     doc.roundedRect(22, y, 25, 6, 2, 2, 'F');
//     doc.setFontSize(9);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont('helvetica', 'bold');
//     doc.text(categoryLabel, 34.5, y + 4, { align: 'center' });

//     // Domain/Categories with enhanced styling
//     if (program.categories?.length) {
//       doc.setFillColor(240, 248, 255);
//       const domainText = `DOMAIN: ${program.categories.join(', ')}`;
//       const textWidth = doc.getTextWidth(domainText) + 8;
//       doc.roundedRect(50, y, textWidth, 6, 2, 2, 'F');
//       doc.setFontSize(9);
//       doc.setTextColor(0, 123, 191);
//       doc.setFont('helvetica', 'normal');
//       doc.text(domainText, 54, y + 4);
//     }
    
//     y += 10;

//     // Enhanced AI Recommendations
//     if (program.aiRecommendation) {
//       y = this.addAIInsights(doc, program, y);
//     }

//     y += 8;

//     // Handle pagination
//     if (y > 240 && i < programs.length - 1) {
//       doc.addPage();
//       this.addCorporateHeader(doc);
//       // addFooter();
//       y = 35;
//     }
//   }

//   return y;
// }

// private addAIInsights(doc: jsPDF, program: any, startY: number): number {
//   let y = startY;
//   const ai = program.aiRecommendation;
//   // Enhanced AI Insights Header
//   doc.setFillColor(15, 32, 82);
//   doc.roundedRect(25, y, 165, 12, 4, 4, 'F');
  
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(11);
//   doc.setTextColor(255, 255, 255);
//   doc.text(`Career Insights: ${program.name}`, 30, y + 8);
//   y += 18;
//   const lineSpacing = 4;
//   const addInsightBlock = (
//     title: string, 
//     content: string | undefined | null, 
//     iconColor: [number, number, number],
//     bgColor: [number, number, number]
//   ): void => {
//     if (!content || content.trim() === '') return;
    
//     const clean = this.cleanAIText(content);
//     const lines = doc.splitTextToSize(clean, 150);
//     const blockHeight = 12 + (lines.length * lineSpacing) + 6;
    
//     const pageHeight = doc.internal.pageSize.getHeight();
//     if (y + blockHeight > pageHeight - 25) {
//       doc.addPage();
//       this.addCorporateHeader(doc);
//       y = 35;
//     }

//     // Enhanced insight block with colored background
//     doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
//     doc.roundedRect(30, y, 155, blockHeight, 3, 3, 'F');
    
//     // Left colored accent bar
//     doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
//     doc.roundedRect(30, y, 2, blockHeight, 1, 1, 'F');

//     // Title with icon styling
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(11);
//     doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
//     doc.text(title, 38, y + 8);
    
//     y += 12;

//     // Content with enhanced readability
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9);
//     doc.setTextColor(60, 60, 60);
    
//     for (const line of lines) {
//       doc.text(line, 38, y);
//       y += lineSpacing;
//     }
    
//     y += 6;
//   };

//   // Enhanced insight blocks with distinct colors
//   addInsightBlock('Career Path', ai.careerPath, [34, 139, 34], [248, 255, 248]);
//   addInsightBlock('Job Opportunities', ai.jobOpportunities, [0, 123, 191], [240, 248, 255]);
//   addInsightBlock('Future Prospects', ai.futureProspects, [138, 43, 226], [248, 245, 255]);

//   // Professional separator
//   doc.setDrawColor(220, 230, 240);
//   doc.setLineWidth(0.5);
//   doc.line(25, y, 190, y);
//   y += 5;

//   return y;
// }

// private cleanAIText(text: string): string {
//   return text
//     .replace(/\*\*(.*?)\*\*/g, '$1')
//     .replace(/\*(.*?)\*/g, '$1')
//     .replace(/^\s*[-•*]\s*/gm, '• ')
//     .replace(/\n{3,}/g, '\n\n')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// private addCorporateHeader(doc: jsPDF): void {
//   const title = 'University Eligibility Report';
//   const subtitle = 'Generated by EduMatch AI – Tailored Pathways to Your Future';

//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(16);
//   doc.setTextColor(15, 32, 82);
//   doc.text(title, 20, 15);

//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(10);
//   doc.setTextColor(100, 100, 100);
//   doc.text(subtitle, 20, 21);

//   // Page number with enhanced styling
//   doc.setFillColor(240, 248, 255);
//   doc.roundedRect(175, 8, 25, 8, 2, 2, 'F');
  
//   doc.setFontSize(9);
//   doc.setTextColor(0, 123, 191);
//   doc.setFont('helvetica', 'bold');
//   doc.text(`Page ${doc.getNumberOfPages()}`, 187.5, 13, { align: 'center' });
// }







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

  const addFooter = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 270, 210, 27, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('This report was generated by EduVision Pro Analytics Engine', 105, 280, { align: 'center' });
    doc.setTextColor(0, 123, 191);
    doc.text('For questions, contact: optimusinforservice@gmail.com', 105, 285, { align: 'center' });
  };

  // Professional Cover Header with Gradient Effect
  doc.setFillColor(15, 32, 82);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Header accent stripe
  doc.setFillColor(0, 123, 191);
  doc.rect(0, 42, 210, 8, 'F');

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ADMISSION ELIGIBILITY', 105, 22, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(200, 220, 240);
  doc.text('COMPREHENSIVE ANALYSIS REPORT', 105, 32, { align: 'center' });

  // Candidate Information Box
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(30, 65, 150, 35, 5, 5, 'F');

  doc.setFontSize(12);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', 105, 75, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 123, 191);
  doc.text(result.examCheckRecord?.candidateName || 'Candidate', 105, 85, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${result.id}`, 105, 92, { align: 'center' });
  doc.text(`Generated: ${formattedDate}`, 105, 97, { align: 'center' });

  // EXECUTIVE SUMMARY
  let y = 115;

  doc.setFontSize(18);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, y);
  
  doc.setDrawColor(0, 123, 191);
  doc.setLineWidth(1);
  doc.line(20, y + 4, 75, y + 4);

  // Calculate statistics
  const totalEligible = this.getTotalEligiblePrograms(result);
  const totalAlternative = this.getTotalAlternativePrograms(result);
  const totalPrograms = totalEligible + totalAlternative;
  
  // Enhanced Summary Table
  autoTable(doc, {
    startY: y + 12,
    head: [['Key Metrics', 'Results']],
    body: [
      ['Total Universities Analyzed', result.universities.length.toString()],
      ['Highly Eligible Programs', totalEligible.toString()],
      ['Alternative Options', totalAlternative.toString()],
      ['Total Programs Found', totalPrograms.toString()],
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
      0: { fontStyle: 'bold', textColor: [15, 32, 82], cellWidth: 80 },
      1: { textColor: [0, 123, 191], fontStyle: 'bold', halign: 'center' }
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto',
    didDrawPage: function(data) {
      addFooter();
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Selected Categories Summary
  if (Array.isArray(result.selectedCategories) && result.selectedCategories.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 32, 82);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Study Areas', 20, y);
    y += 8;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, 170, 10 + (Math.ceil(result.selectedCategories.length / 3) * 8), 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 123, 191);
    doc.setFont('helvetica', 'normal');
    
    let xPos = 25;
    let yPos = y + 6;
    result.selectedCategories.forEach((category: string, index: number) => {
      doc.text(`• ${category}`, xPos, yPos);
      xPos += 60;
      if ((index + 1) % 3 === 0) {
        xPos = 25;
        yPos += 8;
      }
    });
    
    y = y + 10 + (Math.ceil(result.selectedCategories.length / 3) * 8) + 10;
  }

  // University Analysis Section Header
  doc.setFontSize(18);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed University Analysis', 20, y);
  
  doc.setDrawColor(0, 123, 191);
  doc.setLineWidth(2);
  doc.line(20, y + 2, 100, y + 2);
  y += 15;

  // Loop through universities
  for (let i = 0; i < result.universities.length; i++) {
    const university = result.universities[i];
    const eligibleCount = university.eligiblePrograms?.length ?? 0;
    const alternativeCount = university.alternativePrograms?.length ?? 0;
    const estimatedHeight = 40 + (eligibleCount + alternativeCount) * 55;
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y + estimatedHeight > pageHeight - 30) {
      doc.addPage();
      this.addCorporateHeader(doc);
      addFooter();
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

    // University Details with enhanced layout
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, 170, 10, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Type: ${university.type}`, 25, y + 7);
    doc.text(`• Location: ${university.location}`, 80, y + 7);
    
    // Programs summary
    const programSummary = `Programs: ${eligibleCount} Eligible, ${alternativeCount} Alternative`;
    doc.setTextColor(0, 123, 191);
    doc.setFont('helvetica', 'bold');
    doc.text(programSummary, 130, y + 7);
    
    y += 15;

    // Eligible Programs
    if (eligibleCount > 0) {
      y = this.addProgramsWithInsights(doc, university.eligiblePrograms, 'Highly Eligible Programs', [34, 139, 34], y, 'Eligible');
    }

    // Alternative Programs
    if (alternativeCount > 0) {
      y = this.addProgramsWithInsights(doc, university.alternativePrograms, 'Alternative Programs', [191, 87, 0], y, 'Alternative');
    }

    y += 10;
  }

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

  
  // doc.setFillColor(color[0], color[1], color[2]);
  // doc.roundedRect(20, y, 170, 10, 3, 3, 'F');
  // doc.setFontSize(12);
  // doc.setTextColor(255, 255, 255);
  // doc.setFont('helvetica', 'bold');
  // doc.text(`${sectionTitle} (${programs.length})`, 25, y + 7);
  // y += 15;

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];

    // Enhanced Program Table
    autoTable(doc, {
      startY: y,
      head: [['Program Name', 'Likelihood of Admission']],
      body: [[
        program.name || 'Unknown Program',
        `${(program.percentage ?? 0).toFixed(1)}%`,
        // this.formatCutoffPoints(program.cutoffPoints)
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
        fontSize: 11
      },
      bodyStyles: {
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 32, 82], cellWidth: 110 },
        1: { textColor: color, fontStyle: 'bold', halign: 'center', cellWidth: 60 },
        // 2: { textColor: [80, 80, 80], halign: 'center', cellWidth: 40 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto'
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    // Enhanced Category Badge and Domain display
    const badgeY = y;
    
    // Status Badge
    const badgeColor = categoryLabel === 'Eligible' ? [34, 139, 34] : [191, 87, 0];
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(22, badgeY, 28, 7, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryLabel, 36, badgeY + 4.5, { align: 'center' });

    // Categories/Domains
    if (program.categories?.length) {
      const domainText = `${program.categories.join(' • ')}`;
      doc.setFillColor(240, 248, 255);
      const textWidth = doc.getTextWidth(domainText) + 10;
      doc.roundedRect(53, badgeY, textWidth, 7, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(0, 123, 191);
      doc.setFont('helvetica', 'normal');
      doc.text(domainText, 58, badgeY + 4.5);
    }
    
    y += 12;

    // Requirements Explanation Section
    if (program.explanations?.length > 0) {
      y = this.addRequirementExplanations(doc, program.explanations, y);
    }

    // AI Recommendations
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


private addRequirementExplanations(doc: jsPDF, explanations: string[], startY: number): number {
  let y = startY;

  // Draw background block for section header
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(25, y, 165, 10, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(15, 32, 82);
  doc.setFont('helvetica', 'bold');
  doc.text('Requirements Analysis', 30, y + 7);
  y += 12;

  // ✅ Filter out the specific explanation
  const filteredExplanations = explanations.filter(
    (explanation) => !explanation.includes('⚠️ Alternative')
  );

  // Prepare data for the table
  const okayRows: string[] = [];
  const missedRows: string[] = [];
  const belowReqRows: string[] = [];

  filteredExplanations.forEach((explanation) => {
    const cleanText = explanation.replace(/[✅⚠️❌]/g, '').trim();
    if (explanation.includes('✅')) okayRows.push(cleanText);
    else if (explanation.includes('⚠️')) belowReqRows.push(cleanText);
    else if (explanation.includes('❌')) missedRows.push(cleanText);
  });

  const maxRows = Math.max(okayRows.length, missedRows.length, belowReqRows.length);
  const tableData = [];

  for (let i = 0; i < maxRows; i++) {
    tableData.push([
      okayRows[i] || '',
      missedRows[i] || '',
      belowReqRows[i] || '',
    ]);
  }

  // Generate the table
  autoTable(doc, {
    head: [['OKAY', 'MISSED', 'BELOW REQUIREMENT']],
    body: tableData,
    startY: y,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      lineColor: [220, 230, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [15, 32, 82],
      textColor: [255, 255, 255],
      halign: 'center',
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { textColor: [34, 139, 34], cellWidth: 55 },  // OKAY
      1: { textColor: [191, 87, 0], cellWidth: 55 },   // Missed
      2: { textColor: [220, 20, 60], cellWidth: 55 },  // Below Requirement
    },
    margin: { left: 25, right: 20 },
    tableWidth: 'auto',
  });

  // Return new Y position after the table
  return (doc as any).lastAutoTable.finalY + 8;
}



















private addAIInsights(doc: jsPDF, program: any, startY: number): number {
  let y = startY;
  const ai = program.aiRecommendation;
  
  // AI Insights Header
  doc.setFillColor(15, 32, 82);
  doc.roundedRect(25, y, 165, 12, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Career Insights: ${program.name}`, 30, y + 8);
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

    // Enhanced insight block
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(30, y, 155, blockHeight, 3, 3, 'F');
    
    // Left colored accent bar
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.roundedRect(30, y, 2, blockHeight, 1, 1, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.text(title, 38, y + 8);
    
    y += 12;

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    for (const line of lines) {
      doc.text(line, 38, y);
      y += lineSpacing;
    }
    
    y += 6;
  };

  // Add insight blocks
  addInsightBlock('Career Path', ai.careerPath, [34, 139, 34], [248, 255, 248]);
  addInsightBlock('Job Opportunities', ai.jobOpportunities, [0, 123, 191], [240, 248, 255]);
  addInsightBlock('Future Prospects', ai.futureProspects, [138, 43, 226], [248, 245, 255]);

  // Separator
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
  const subtitle = 'Generated by EduVision Pro – Tailored Pathways to Your Future';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 32, 82);
  doc.text(title, 20, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 20, 21);

  // Page number badge
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(175, 8, 25, 8, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(0, 123, 191);
  doc.setFont('helvetica', 'bold');
  doc.text(`Page ${doc.getNumberOfPages()}`, 187.5, 13, { align: 'center' });
}

private formatCutoffPoints(cutoffPoints: any): string {
  if (!cutoffPoints || Object.keys(cutoffPoints).length === 0) {
    return 'N/A';
  }
  return Object.entries(cutoffPoints)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

 getTotalEligiblePrograms(result: EligibilityResult): number {
  return result.universities.reduce((total, uni) => 
    total + (uni.eligiblePrograms?.length ?? 0), 0
  );
}

 getTotalAlternativePrograms(result: EligibilityResult): number {
  return result.universities.reduce((total, uni) => 
    total + (uni.alternativePrograms?.length ?? 0), 0
  );
}

























































































































































































































// COLAPSABLE
 





// showAll: Record<string, Record<SectionKey, boolean>> = {};
// toggleShowAll(programId: string, section: SectionKey): void {
//   if (!this.showAll[programId]) {
//     this.showAll[programId] = { core: false, alternative: false, recommendations: false };
//   }
//   this.showAll[programId][section] = !this.showAll[programId][section];
// }


// getSections(text: string): Record<SectionKey, string[]> {
//   if (!text) return { core: [], alternative: [], recommendations: [] };
//   const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
//   const sections: Record<SectionKey, string[]> = { core: [], alternative: [], recommendations: [] };
//   let currentSection: SectionKey | null = null;
//   for (const line of lines) {
//     if (line.startsWith('📚')) {
//       currentSection = 'core';
//       continue;
//     }
//     if (line.startsWith('🔄')) {
//       currentSection = 'alternative';
//       continue;
//     }
//     if (line.startsWith('💡')) {
//       currentSection = 'recommendations';
//       continue;
//     }

//     // Push lines to their appropriate section
//     if (currentSection) {
//       sections[currentSection].push(line);
//     }
//   }

//   return sections;
// }

// /**
//  * Return visible lines for a given section with “Show All / Less” handling.
//  */
// getVisibleLines(
//   sections: Record<SectionKey, string[]>,
//   section: SectionKey,
//   programId: string
// ): string[] {
//   const lines = sections[section] || [];
//   const expanded = this.showAll[programId]?.[section] ?? false;
//   return expanded ? lines : lines.slice(0, 3);
// }

// getStatusIcon(line: string): string {
//   const icons = ['✅', '⚠️', '❌', '🎯', '⭐', '📋'];
//   return icons.find(icon => line.startsWith(icon)) || '';
// }

// extractSubject(line: string): string {
//   const subjectMatch = line.match(/^[✅⚠️❌🎯⭐📋]+\s*(.*?):/);
//   if (subjectMatch) return subjectMatch[1].trim();
//   if (line.includes('group:')) {
//     const match = line.match(/\[(.*?)\]/);
//     return match ? `Group: ${match[1]}` : 'Unmatched group';
//   }
//   return line;
// }

// extractRemarks(line: string): string {
//   const match = line.match(/\b([A-Z0-9]+)\b.*?\(Required:\s*([A-Z0-9]+)\)/);
//   if (match) {
//     const [, candidate, required] = match;
//     return `Your grade: ${candidate}, Required: ${required}`;
//   }
//   if (/Missing/i.test(line)) return 'Requirement not met';
//   if (/Excellent|Pass/i.test(line)) return 'Requirement satisfied';
//   if (/Does not meet requirement/i.test(line)) return 'Below requirement';
//   if (/No matching subjects found/i.test(line)) return 'No subjects in required group';
//   return '';
// }

// /**
//  * Splits the API response into core, alternative, and recommendations sections.
//  */
// splitRecommendationSections(recommendationText: string): {
//   core: string[];
//   alternative: string[];
//   recommendations: string[];
// } {
//   if (!recommendationText) return { core: [], alternative: [], recommendations: [] };

//   const lines = recommendationText.split('\n').map(l => l.trim()).filter(Boolean);

//   const coreIndex = lines.findIndex(l => l.startsWith('📚'));
//   const altIndex = lines.findIndex(l => l.startsWith('🔄'));
//   const recIndex = lines.findIndex(l => l.startsWith('💡'));

//   const core = coreIndex !== -1 && altIndex !== -1
//     ? lines.slice(coreIndex + 1, altIndex)
//     : [];
//   const alternative = altIndex !== -1 && recIndex !== -1
//     ? lines.slice(altIndex + 1, recIndex)
//     : [];
//   const recommendations = recIndex !== -1
//     ? lines.slice(recIndex + 1)
//     : [];

//   return { core, alternative, recommendations };
// }

// Track show all state per program and section
  showAll: Record<string, Record<SectionKey, boolean>> = {};

  /**
   * Toggle show all/less for a specific section
   */
  toggleShowAll(programId: string, section: SectionKey): void {
    if (!this.showAll[programId]) {
      this.showAll[programId] = { core: false, alternative: false, recommendations: false };
    }
    this.showAll[programId][section] = !this.showAll[programId][section];
  }

  /**
   * Check if show all is enabled for a section
   */
  isShowingAll(programId: string, section: SectionKey): boolean {
    return this.showAll[programId]?.[section] ?? false;
  }

  /**
   * Main parsing function - converts recommendation text to structured data
   */
  parseRecommendation(text: string): RecommendationSections {
    if (!text) return { core: [], alternative: [], recommendations: [] };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections: RecommendationSections = {
      core: [],
      alternative: [],
      recommendations: []
    };

    let currentSection: SectionKey | null = null;

    for (const line of lines) {
      // Detect section headers
      if (line.includes('📚 CORE SUBJECTS')) {
        currentSection = 'core';
        continue;
      }
      if (line.includes('🔄 ALTERNATIVE REQUIREMENTS')) {
        currentSection = 'alternative';
        continue;
      }
      if (line.includes('💡 RECOMMENDATIONS')) {
        currentSection = 'recommendations';
        continue;
      }

      // Skip header lines
      if (line.startsWith('⚠️') || line.startsWith('📚') || 
          line.startsWith('🔄') || line.startsWith('💡')) {
        continue;
      }

      // Parse and add to appropriate section
      if (currentSection === 'core' || currentSection === 'alternative') {
        const parsed = this.parseLine(line);
        if (parsed) {
          sections[currentSection].push(parsed);
        }
      } else if (currentSection === 'recommendations') {
        const cleanLine = line.replace(/^[📋⭐]\s*/, '').trim();
        if (cleanLine) {
          sections.recommendations.push(cleanLine);
        }
      }
    }

    return sections;
  }

  /**
   * Get visible items for a section with show all/less handling
   */
  getVisibleItems(
    sections: RecommendationSections,
    section: 'core' | 'alternative',
    programId: string,
    limit: number = 3
  ): ParsedLine[] {
    const items = sections[section] || [];
    const expanded = this.isShowingAll(programId, section);
    return expanded ? items : items.slice(0, limit);
  }

  /**
   * Get visible recommendations with show all/less handling
   */
  getVisibleRecommendations(
    sections: RecommendationSections,
    programId: string,
    limit: number = 3
  ): string[] {
    const items = sections.recommendations || [];
    const expanded = this.isShowingAll(programId, 'recommendations');
    return expanded ? items : items.slice(0, limit);
  }

  /**
   * Check if section has more items than the limit
   */
  hasMoreItems(
    sections: RecommendationSections,
    section: SectionKey,
    limit: number = 3
  ): boolean {
    if (section === 'recommendations') {
      return sections.recommendations.length > limit;
    }
    return sections[section].length > limit;
  }

  /**
   * Parse individual line into structured data
   */
  private parseLine(line: string): ParsedLine | null {
    // Remove emoji prefix
    const cleanLine = line.replace(/^[✅❌]\s*/, '').trim();
    
    if (!cleanLine) return null;

    // Determine status from emoji and content
    const status = this.getLineStatus(line);

    // Pattern 1: Subject with grades - "MATHEMATICS(CORE): B2 (Required: C5) - Excellent!"
    const gradePattern = /^([^:]+):\s*([A-D]\d+)\s*\(Required:\s*([A-D]\d+)\)\s*-\s*(.+)$/;
    const gradeMatch = cleanLine.match(gradePattern);
    
    if (gradeMatch) {
      return {
        status,
        subject: gradeMatch[1].trim(),
        yourGrade: gradeMatch[2].trim(),
        requirement: gradeMatch[3].trim(),
        remarks: gradeMatch[4].trim(),
        originalLine: line
      };
    }

    // Pattern 2: Missing subject - "ENGLISH LANGUAGE: Missing (Required: C5)"
    const missingPattern = /^([^:]+):\s*Missing\s*\(Required:\s*([A-D]\d+)\)$/;
    const missingMatch = cleanLine.match(missingPattern);
    
    if (missingMatch) {
      return {
        status,
        subject: missingMatch[1].trim(),
        requirement: missingMatch[2].trim(),
        remarks: 'Missing',
        originalLine: line
      };
    }

    // Pattern 3: Group requirements - "No matching subjects found in group: [...]"
    const groupPattern = /No matching subjects found in group:\s*\[([^\]]+)\]/;
    const groupMatch = cleanLine.match(groupPattern);
    
    if (groupMatch) {
      return {
        status,
        subject: 'Group Requirement',
        remarks: `No match in: ${groupMatch[1].trim()}`,
        originalLine: line
      };
    }

    // Pattern 4: Alternative anyOf
    if (cleanLine.includes('Alternative') && cleanLine.includes('anyOf')) {
      return {
        status,
        subject: 'Alternative Requirement',
        remarks: cleanLine,
        originalLine: line
      };
    }

    // Default: treat entire line as subject with general remark
    return {
      status,
      subject: cleanLine,
      remarks: '',
      originalLine: line
    };
  }

  /**
   * Determine status from line content
   */
  private getLineStatus(line: string): 'pass' | 'fail' | 'excellent' | 'neutral' {
    if (line.startsWith('✅')) {
      if (line.includes('Excellent!')) return 'excellent';
      return 'pass';
    }
    if (line.startsWith('❌')) return 'fail';
    return 'neutral';
  }

  /**
   * Get status icon HTML for display
   */
  getStatusIcon(parsedLine: ParsedLine): string {
    switch (parsedLine.status) {
      case 'pass':
        return '✅';
      case 'excellent':
        return '✅';
      case 'fail':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Get status icon from raw line (backward compatibility)
   */
  getStatusIconFromLine(line: string): string {
    const icons = ['✅', '⚠️', '❌', '🎯', '⭐', '📋'];
    return icons.find(icon => line.startsWith(icon)) || '';
  }

  /**
   * Extract subject from raw line (backward compatibility)
   */
  extractSubject(line: string): string {
    const subjectMatch = line.match(/^[✅⚠️❌🎯⭐📋]+\s*(.*?):/);
    if (subjectMatch) return subjectMatch[1].trim();
    if (line.includes('group:')) {
      const match = line.match(/\[(.*?)\]/);
      return match ? `Group: ${match[1]}` : 'Unmatched group';
    }
    return line;
  }

  /**
   * Extract remarks from raw line (backward compatibility)
   */
  extractRemarks(line: string): string {
    const match = line.match(/\b([A-Z0-9]+)\b.*?\(Required:\s*([A-Z0-9]+)\)/);
    if (match) {
      const [, candidate, required] = match;
      return `Your grade: ${candidate}, Required: ${required}`;
    }
    if (/Missing/i.test(line)) return 'Requirement not met';
    if (/Excellent|Pass/i.test(line)) return 'Requirement satisfied';
    if (/Does not meet requirement/i.test(line)) return 'Below requirement';
    if (/No matching subjects found/i.test(line)) return 'No subjects in required group';
    return '';
  }

  /**
   * Get icon for recommendation items
   */
  getRecommendationIcon(recommendation: string): string {
    if (recommendation.toLowerCase().includes('missing')) {
      return '📋';
    }
    if (recommendation.toLowerCase().includes('strong') || 
        recommendation.toLowerCase().includes('performance')) {
      return '⭐';
    }
    return '💡';
  }

  /**
   * Get CSS class for status
   */
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  /**
   * Legacy method for compatibility
   */
  splitRecommendationSections(recommendationText: string): {
    core: string[];
    alternative: string[];
    recommendations: string[];
  } {
    if (!recommendationText) return { core: [], alternative: [], recommendations: [] };

    const lines = recommendationText.split('\n').map(l => l.trim()).filter(Boolean);

    const coreIndex = lines.findIndex(l => l.startsWith('📚'));
    const altIndex = lines.findIndex(l => l.startsWith('🔄'));
    const recIndex = lines.findIndex(l => l.startsWith('💡'));

    const core = coreIndex !== -1 && altIndex !== -1
      ? lines.slice(coreIndex + 1, altIndex)
      : [];
    const alternative = altIndex !== -1 && recIndex !== -1
      ? lines.slice(altIndex + 1, recIndex)
      : [];
    const recommendations = recIndex !== -1
      ? lines.slice(recIndex + 1)
      : [];

    return { core, alternative, recommendations };
  }
}
