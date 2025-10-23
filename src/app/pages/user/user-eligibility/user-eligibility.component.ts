import { Component, Input } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { EligibilityResult } from 'src/app/customModels/eligibility.model';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';

// Types
type SectionKey = 'core' | 'alternative' | 'recommendations';

type SectionElegibleKey = 'core' | 'eligibility' | 'recommendations';


// Replace emoji-based detection with structured markers
interface SectionMarkers {
  CORE_HEADER: string;
  ALTERNATIVE_HEADER: string;
  RECOMMENDATIONS_HEADER: string;
  PASS: string;
  FAIL: string;
  INFO: string;
}


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
 // Requirements Explanation Section
if (program.aiRecommendation?.recommendationText) {
  y = this.addRequirementExplanations(doc, program.aiRecommendation.recommendationText, y);
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







































private addRequirementExplanations(doc: jsPDF, recommendationText: string, startY: number): number {
  let y = startY;
  const lines = recommendationText.split('\n').filter((l) => l.trim() !== '');

  // 🔍 Robust section detection - checks both emoji and text
  const findSection = (emojiPattern: string, textPattern: string): number => {
    return lines.findIndex((l) => 
      l.includes(emojiPattern) || l.toUpperCase().includes(textPattern.toUpperCase())
    );
  };

  // Extract section boundaries with fallback text patterns
  const coreStart = findSection('📚', 'CORE SUBJECTS ANALYSIS');
  const altStart = findSection('🔄', 'ALTERNATIVE REQUIREMENTS');
  const recStart = findSection('💡', 'RECOMMENDATIONS');

  // Extract section lines
  const coreLines =
    coreStart !== -1
      ? lines.slice(coreStart + 1, altStart !== -1 ? altStart : recStart !== -1 ? recStart : lines.length)
      : [];

  const altLines =
    altStart !== -1
      ? lines.slice(altStart + 1, recStart !== -1 ? recStart : lines.length)
      : [];

  const recLines = recStart !== -1 ? lines.slice(recStart + 1, lines.length) : [];

  // 🧱 Section header helper
  const drawSectionHeader = (title: string, color: [number, number, number]) => {
    doc.setFillColor(...color, 20);
    doc.roundedRect(25, y, 165, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(title, 30, y + 6);
    y += 10;
  };

  // 🧾 Helper for 3-column table
  const createAnalysisTable = (rows: string[], color: [number, number, number]) => {
    const ok: string[] = [];
    const warn: string[] = [];
    const fail: string[] = [];

    // Robust status detection - checks both emoji and keywords
    rows.forEach((line) => {
      // Clean both valid emojis and corrupted question marks
      const clean = line.replace(/[✅⚠️❌?]/g, '').trim();
      const hasOkEmoji = line.includes('✅');
      const hasWarnEmoji = line.includes('⚠️');
      const hasFailEmoji = line.includes('❌');
      
      // Check for text patterns as fallback
      const hasOkText = /excellent|pass(?!ed)|meets?\s+requirement/i.test(line);
      const hasWarnText = /missing|partial|incomplete/i.test(line);
      const hasFailText = /does\s+not\s+meet|below|failed?|no\s+matching/i.test(line);

      if (hasOkEmoji || (!hasWarnEmoji && !hasFailEmoji && hasOkText)) {
        ok.push(clean);
      } else if (hasWarnEmoji || (!hasOkEmoji && !hasFailEmoji && hasWarnText)) {
        warn.push(clean);
      } else if (hasFailEmoji || (!hasOkEmoji && !hasWarnEmoji && hasFailText)) {
        fail.push(clean);
      }
    });

    // Add fallback text only if *some data exists*
    const hasContent = ok.length > 0 || warn.length > 0 || fail.length > 0;

    if (hasContent) {
      if (ok.length === 0) ok.push('NA');
      if (warn.length === 0) warn.push('NA');
      if (fail.length === 0) fail.push('NA');

      const maxRows = Math.max(ok.length, warn.length, fail.length);
      const tableData = Array.from({ length: maxRows }, (_, i) => [
        ok[i] || 'NA',
        warn[i] || 'NA',
        fail[i] || 'NA',
      ]);

      autoTable(doc, {
        head: [['OKAY', 'MISSING', 'BELOW REQUIREMENT']],
        body: tableData,
        startY: y,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: 'middle',
          halign: 'center',
          lineColor: [230, 235, 240],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: color,
          textColor: [255, 255, 255],
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: 9,
        },
        columnStyles: {
          0: { textColor: [34, 139, 34], cellWidth: 55, halign: 'center', valign: 'middle' },
          1: { textColor: [191, 87, 0], cellWidth: 55, halign: 'center', valign: 'middle' },
          2: { textColor: [220, 20, 60], cellWidth: 55, halign: 'center', valign: 'middle' },
        },
        margin: { left: 25, right: 20 },
        tableWidth: 'auto',
      });

      y = (doc as any).lastAutoTable.finalY + 6;
    }

    return hasContent;
  };

  // 🟦 Core Subjects - check for status indicators (emoji or text)
  if (coreLines.some((l) => /✅|⚠️|❌|excellent|pass|missing|failed?|does\s+not\s+meet/i.test(l))) {
    drawSectionHeader('Core Subjects Analysis', [15, 32, 82]);
    createAnalysisTable(coreLines, [15, 32, 82]);
  }

  // 🟧 Alternative Requirements
  if (altLines.some((l) => /✅|⚠️|❌|excellent|pass|missing|failed?|does\s+not\s+meet/i.test(l))) {
    drawSectionHeader('Alternative Requirements', [245, 158, 11]);
    createAnalysisTable(altLines, [245, 158, 11]);
  }

  // 💡 Recommendations (NOTE)
  if (recLines.length > 0 && recLines.some((r) => r.trim() !== '')) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 70, 80);
    doc.text('NOTE:', 25, y + 4);
    y += 6;

    // Clean both valid emojis and corrupted question marks from recommendations
    const formatted = recLines.map((r) => [r.replace(/[💡📋⭐?]/g, '').trim()]);

    autoTable(doc, {
      body: formatted,
      startY: y,
      theme: 'plain',
      styles: {
        fontSize: 9,
        textColor: [60, 70, 80],
        cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 28, right: 25 },
      tableWidth: 'auto',
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  return y;
}






























































































































private addAIInsights(doc: jsPDF, program: any, startY: number): number {
  let y = startY;
  const ai = program.aiRecommendation;
  


  // AI Insights Header
  // doc.setFillColor(15, 32, 82);
  // doc.roundedRect(25, y, 165, 12, 4, 4, 'F');
  
  // // doc.setFont('helvetica', 'bold');
  // // doc.setFontSize(11);
  // // doc.setTextColor(255, 255, 255);
  // // // doc.text(`Career Insights: ${program.name}`, 30, y + 8);
  // // y += 18;
  
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

//   const addFooter = () => {
//     doc.setFillColor(248, 250, 252);
//     doc.rect(0, 270, 210, 27, 'F');
    
//     doc.setFontSize(7);
//     doc.setTextColor(80, 80, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text('This report was generated by EduVision Pro Analytics Engine', 105, 280, { align: 'center' });
//     doc.setTextColor(0, 123, 191);
//     doc.text('For questions, contact: optimusinforservice@gmail.com', 105, 285, { align: 'center' });
//   };

//   // Professional Cover Header with Gradient Effect
//   doc.setFillColor(15, 32, 82);
//   doc.rect(0, 0, 210, 50, 'F');
  
//   // Header accent stripe
//   doc.setFillColor(0, 123, 191);
//   doc.rect(0, 42, 210, 8, 'F');

//   doc.setFontSize(28);
//   doc.setTextColor(255, 255, 255);
//   doc.setFont('helvetica', 'bold');
//   doc.text('ADMISSION ELIGIBILITY', 105, 22, { align: 'center' });
//   doc.setFontSize(18);
//   doc.setTextColor(200, 220, 240);
//   doc.text('COMPREHENSIVE ANALYSIS REPORT', 105, 32, { align: 'center' });

//   // Candidate Information Box
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

//   // EXECUTIVE SUMMARY
//   let y = 115;

//   doc.setFontSize(18);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Executive Summary', 20, y);
  
//   doc.setDrawColor(0, 123, 191);
//   doc.setLineWidth(1);
//   doc.line(20, y + 4, 75, y + 4);

//   // Calculate statistics
//   const totalEligible = this.getTotalEligiblePrograms(result);
//   const totalAlternative = this.getTotalAlternativePrograms(result);
//   const totalPrograms = totalEligible + totalAlternative;
  
//   // Enhanced Summary Table
//   autoTable(doc, {
//     startY: y + 12,
//     head: [['Key Metrics', 'Results']],
//     body: [
//       ['Total Universities Analyzed', result.universities.length.toString()],
//       ['Highly Eligible Programs', totalEligible.toString()],
//       ['Alternative Options', totalAlternative.toString()],
//       ['Total Programs Found', totalPrograms.toString()],
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
//       0: { fontStyle: 'bold', textColor: [15, 32, 82], cellWidth: 80 },
//       1: { textColor: [0, 123, 191], fontStyle: 'bold', halign: 'center' }
//     },
//     margin: { left: 20, right: 20 },
//     tableWidth: 'auto',
//     didDrawPage: function(data) {
//       addFooter();
//     }
//   });

//   y = (doc as any).lastAutoTable.finalY + 15;

//   // Selected Categories Summary
//   if (Array.isArray(result.selectedCategories) && result.selectedCategories.length > 0) {
//     doc.setFontSize(13);
//     doc.setTextColor(15, 32, 82);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Selected Study Areas', 20, y);
//     y += 8;

//     doc.setFillColor(248, 250, 252);
//     doc.roundedRect(20, y, 170, 10 + (Math.ceil(result.selectedCategories.length / 3) * 8), 3, 3, 'F');
    
//     doc.setFontSize(10);
//     doc.setTextColor(0, 123, 191);
//     doc.setFont('helvetica', 'normal');
    
//     let xPos = 25;
//     let yPos = y + 6;
//     result.selectedCategories.forEach((category: string, index: number) => {
//       doc.text(`• ${category}`, xPos, yPos);
//       xPos += 60;
//       if ((index + 1) % 3 === 0) {
//         xPos = 25;
//         yPos += 8;
//       }
//     });
    
//     y = y + 10 + (Math.ceil(result.selectedCategories.length / 3) * 8) + 10;
//   }

//   // University Analysis Section Header
//   doc.setFontSize(18);
//   doc.setTextColor(15, 32, 82);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Detailed University Analysis', 20, y);
  
//   doc.setDrawColor(0, 123, 191);
//   doc.setLineWidth(2);
//   doc.line(20, y + 2, 100, y + 2);
//   y += 15;

//   // Loop through universities
//   for (let i = 0; i < result.universities.length; i++) {
//     const university = result.universities[i];
//     const eligibleCount = university.eligiblePrograms?.length ?? 0;
//     const alternativeCount = university.alternativePrograms?.length ?? 0;
//     const estimatedHeight = 40 + (eligibleCount + alternativeCount) * 55;
//     const pageHeight = doc.internal.pageSize.getHeight();

//     if (y + estimatedHeight > pageHeight - 30) {
//       doc.addPage();
//       this.addCorporateHeader(doc);
//       addFooter();
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

//     // University Details with enhanced layout
//     doc.setFillColor(248, 250, 252);
//     doc.roundedRect(20, y, 170, 10, 2, 2, 'F');
    
//     doc.setFontSize(10);
//     doc.setTextColor(80, 80, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`• Type: ${university.type}`, 25, y + 7);
//     doc.text(`• Location: ${university.location}`, 80, y + 7);
    
//     // Programs summary
//     const programSummary = `Programs: ${eligibleCount} Eligible, ${alternativeCount} Alternative`;
//     doc.setTextColor(0, 123, 191);
//     doc.setFont('helvetica', 'bold');
//     doc.text(programSummary, 130, y + 7);
    
//     y += 15;

//     // Eligible Programs
//     if (eligibleCount > 0) {
//       y = this.addProgramsWithInsights(doc, university.eligiblePrograms, 'Highly Eligible Programs', [34, 139, 34], y, 'Eligible');
//     }

//     // Alternative Programs
//     if (alternativeCount > 0) {
//       y = this.addProgramsWithInsights(doc, university.alternativePrograms, 'Alternative Programs', [191, 87, 0], y, 'Alternative');
//     }

//     y += 10;
//   }

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

  
//   // doc.setFillColor(color[0], color[1], color[2]);
//   // doc.roundedRect(20, y, 170, 10, 3, 3, 'F');
//   // doc.setFontSize(12);
//   // doc.setTextColor(255, 255, 255);
//   // doc.setFont('helvetica', 'bold');
//   // doc.text(`${sectionTitle} (${programs.length})`, 25, y + 7);
//   // y += 15;

//   for (let i = 0; i < programs.length; i++) {
//     const program = programs[i];

//     // Enhanced Program Table
//     autoTable(doc, {
//       startY: y,
//       head: [['Program Name', 'Likelihood of Admission']],
//       body: [[
//         program.name || 'Unknown Program',
//         `${(program.percentage ?? 0).toFixed(1)}%`,
//         // this.formatCutoffPoints(program.cutoffPoints)
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
//         fontSize: 11
//       },
//       bodyStyles: {
//         textColor: [50, 50, 50]
//       },
//       columnStyles: {
//         0: { fontStyle: 'bold', textColor: [15, 32, 82], cellWidth: 110 },
//         1: { textColor: color, fontStyle: 'bold', halign: 'center', cellWidth: 60 },
//         // 2: { textColor: [80, 80, 80], halign: 'center', cellWidth: 40 }
//       },
//       margin: { left: 20, right: 20 },
//       tableWidth: 'auto'
//     });

//     y = (doc as any).lastAutoTable.finalY + 3;

//     // Enhanced Category Badge and Domain display
//     const badgeY = y;
    
//     // Status Badge
//     const badgeColor = categoryLabel === 'Eligible' ? [34, 139, 34] : [191, 87, 0];
//     doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
//     doc.roundedRect(22, badgeY, 28, 7, 2, 2, 'F');
//     doc.setFontSize(9);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont('helvetica', 'bold');
//     doc.text(categoryLabel, 36, badgeY + 4.5, { align: 'center' });

//     // Categories/Domains
//     if (program.categories?.length) {
//       const domainText = `${program.categories.join(' • ')}`;
//       doc.setFillColor(240, 248, 255);
//       const textWidth = doc.getTextWidth(domainText) + 10;
//       doc.roundedRect(53, badgeY, textWidth, 7, 2, 2, 'F');
//       doc.setFontSize(9);
//       doc.setTextColor(0, 123, 191);
//       doc.setFont('helvetica', 'normal');
//       doc.text(domainText, 58, badgeY + 4.5);
//     }
    
//     y += 12;

//     // Requirements Explanation Section
//  // Requirements Explanation Section
// if (program.aiRecommendation?.recommendationText) {
//   y = this.addRequirementExplanations(doc, program.aiRecommendation.recommendationText, y);
// }

//     // AI Recommendations
//     if (program.aiRecommendation) {
//       y = this.addAIInsights(doc, program, y);
//     }

//     y += 8;

//     // Handle pagination
//     if (y > 240 && i < programs.length - 1) {
//       doc.addPage();
//       this.addCorporateHeader(doc);
//       y = 35;
//     }
//   }

//   return y;
// }










































// private addRequirementExplanations(doc: jsPDF, recommendationText: string, startY: number): number {
//   let y = startY;
//   const lines = recommendationText.split('\n').filter((l) => l.trim() !== '');

//   // 🔍 Extract section boundaries
//   const coreStart = lines.findIndex((l) => l.includes('📚 CORE SUBJECTS ANALYSIS'));
//   const altStart = lines.findIndex((l) => l.includes('🔄 ALTERNATIVE REQUIREMENTS'));
//   const recStart = lines.findIndex((l) => l.includes('💡 RECOMMENDATIONS'));

//   const coreLines =
//     coreStart !== -1
//       ? lines.slice(coreStart + 1, altStart !== -1 ? altStart : recStart !== -1 ? recStart : lines.length)
//       : [];

//   const altLines =
//     altStart !== -1
//       ? lines.slice(altStart + 1, recStart !== -1 ? recStart : lines.length)
//       : [];

//   const recLines = recStart !== -1 ? lines.slice(recStart + 1, lines.length) : [];

//   // 🧱 Section header helper
//   const drawSectionHeader = (title: string, color: [number, number, number]) => {
//     doc.setFillColor(...color, 20);
//     doc.roundedRect(25, y, 165, 9, 2, 2, 'F');
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.setTextColor(...color);
//     doc.text(title, 30, y + 6);
//     y += 10;
//   };

//   // 🧾 Helper for 3-column table
//   const createAnalysisTable = (rows: string[], color: [number, number, number]) => {
//     const ok: string[] = [];
//     const warn: string[] = [];
//     const fail: string[] = [];

//     rows.forEach((line) => {
//       const clean = line.replace(/[✅⚠️❌]/g, '').trim();
//       if (line.includes('✅')) ok.push(clean);
//       else if (line.includes('⚠️')) warn.push(clean);
//       else if (line.includes('❌')) fail.push(clean);
//     });

//     // Add fallback text only if *some data exists*
//     const hasContent = ok.length > 0 || warn.length > 0 || fail.length > 0;

//     if (hasContent) {
//       if (ok.length === 0) ok.push('NA');
//       if (warn.length === 0) warn.push('NA');
//       if (fail.length === 0) fail.push('NA');

//       const maxRows = Math.max(ok.length, warn.length, fail.length);
//       const tableData = Array.from({ length: maxRows }, (_, i) => [
//         ok[i] || 'NA',
//         warn[i] || 'NA',
//         fail[i] || 'NA',
//       ]);

//       autoTable(doc, {
//         head: [['OKAY', 'MISSING', 'BELOW REQUIREMENT']],
//         body: tableData,
//         startY: y,
//         theme: 'grid',
//         styles: {
//           fontSize: 9,
//           cellPadding: 3,
//           valign: 'middle',
//           halign: 'center', // ✅ Center horizontally
//           lineColor: [230, 235, 240],
//           lineWidth: 0.3,
//         },
//         headStyles: {
//           fillColor: color,
//           textColor: [255, 255, 255],
//           halign: 'center', // ✅ Center header text
//           valign: 'middle', // ✅ Center header vertically
//           fontStyle: 'bold',
//           fontSize: 9,
//         },
//         columnStyles: {
//           0: { textColor: [34, 139, 34], cellWidth: 55, halign: 'center', valign: 'middle' },
//           1: { textColor: [191, 87, 0], cellWidth: 55, halign: 'center', valign: 'middle' },
//           2: { textColor: [220, 20, 60], cellWidth: 55, halign: 'center', valign: 'middle' },
//         },
//         margin: { left: 25, right: 20 },
//         tableWidth: 'auto',
//       });

//       y = (doc as any).lastAutoTable.finalY + 6;
//     }

//     return hasContent;
//   };

//   // 🟦 Core Subjects
//   if (coreLines.some((l) => /✅|⚠️|❌/.test(l))) {
//     drawSectionHeader('Core Subjects Analysis', [15, 32, 82]);
//     createAnalysisTable(coreLines, [15, 32, 82]);
//   }

//   // 🟧 Alternative Requirements
//   if (altLines.some((l) => /✅|⚠️|❌/.test(l))) {
//     drawSectionHeader('Alternative Requirements', [245, 158, 11]);
//     createAnalysisTable(altLines, [245, 158, 11]);
//   }

//   // 💡 Recommendations (NOTE)
//   if (recLines.length > 0 && recLines.some((r) => r.trim() !== '')) {
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(9);
//     doc.setTextColor(60, 70, 80);
//     doc.text('NOTE:', 25, y + 4);
//     y += 6;

//     const formatted = recLines.map((r) => [r.replace(/[💡📋⭐]/g, '').trim()]);

//     autoTable(doc, {
//       body: formatted,
//       startY: y,
//       theme: 'plain',
//       styles: {
//         fontSize: 9,
//         textColor: [60, 70, 80],
//         // halign: 'center', // ✅ Center NOTE text
//         // valign: 'middle',
//         cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
//       },
//       alternateRowStyles: {
//         fillColor: [248, 250, 252],
//       },
//       margin: { left: 28, right: 25 },
//       tableWidth: 'auto',
//     });

//     y = (doc as any).lastAutoTable.finalY + 8;
//   }

//   return y;
// }






























































































































// private addAIInsights(doc: jsPDF, program: any, startY: number): number {
//   let y = startY;
//   const ai = program.aiRecommendation;
  


//   // AI Insights Header
//   // doc.setFillColor(15, 32, 82);
//   // doc.roundedRect(25, y, 165, 12, 4, 4, 'F');
  
//   // // doc.setFont('helvetica', 'bold');
//   // // doc.setFontSize(11);
//   // // doc.setTextColor(255, 255, 255);
//   // // // doc.text(`Career Insights: ${program.name}`, 30, y + 8);
//   // // y += 18;
  
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

//     // Enhanced insight block
//     doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
//     doc.roundedRect(30, y, 155, blockHeight, 3, 3, 'F');
    
//     // Left colored accent bar
//     doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
//     doc.roundedRect(30, y, 2, blockHeight, 1, 1, 'F');

//     // Title
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
//     doc.text(title, 38, y + 8);
    
//     y += 12;

//     // Content
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9);
//     doc.setTextColor(60, 60, 60);
    
//     for (const line of lines) {
//       doc.text(line, 38, y);
//       y += lineSpacing;
//     }
    
//     y += 6;
//   };

//   // Add insight blocks
//   addInsightBlock('Career Path', ai.careerPath, [34, 139, 34], [248, 255, 248]);
//   addInsightBlock('Job Opportunities', ai.jobOpportunities, [0, 123, 191], [240, 248, 255]);
//   addInsightBlock('Future Prospects', ai.futureProspects, [138, 43, 226], [248, 245, 255]);

//   // Separator
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
//   const subtitle = 'Generated by EduVision Pro – Tailored Pathways to Your Future';

//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(16);
//   doc.setTextColor(15, 32, 82);
//   doc.text(title, 20, 15);

//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(10);
//   doc.setTextColor(100, 100, 100);
//   doc.text(subtitle, 20, 21);

//   // Page number badge
//   doc.setFillColor(240, 248, 255);
//   doc.roundedRect(175, 8, 25, 8, 2, 2, 'F');
  
//   doc.setFontSize(9);
//   doc.setTextColor(0, 123, 191);
//   doc.setFont('helvetica', 'bold');
//   doc.text(`Page ${doc.getNumberOfPages()}`, 187.5, 13, { align: 'center' });
// }

// private formatCutoffPoints(cutoffPoints: any): string {
//   if (!cutoffPoints || Object.keys(cutoffPoints).length === 0) {
//     return 'N/A';
//   }
//   return Object.entries(cutoffPoints)
//     .map(([key, value]) => `${key}: ${value}`)
//     .join(', ');
// }

//  getTotalEligiblePrograms(result: EligibilityResult): number {
//   return result.universities.reduce((total, uni) => 
//     total + (uni.eligiblePrograms?.length ?? 0), 0
//   );
// }

//  getTotalAlternativePrograms(result: EligibilityResult): number {
//   return result.universities.reduce((total, uni) => 
//     total + (uni.alternativePrograms?.length ?? 0), 0
//   );
// }



















































































































































































































// activeCardId: number | null = null;

// isCardActive(programId: number): boolean {
//   return this.activeCardId === programId;
// }


// // COLAPSABLE
//   showAll: Record<string, Record<SectionKey, boolean>> = {};

//     showAllElegiblity: Record<string, Record<SectionElegibleKey, boolean>> = {};

//       toggleShowAllEligible(programId: string, section: SectionElegibleKey): void {
//     if (!this.showAllElegiblity[programId]) {
//       this.showAllElegiblity[programId] = { core: false, eligibility: false, recommendations: false };
//     }
//     this.showAllElegiblity[programId][section] = !this.showAllElegiblity[programId][section];
//   }

//   toggleCard(event: Event) {
//   const card = (event.target as HTMLElement).closest('.eligibility-card');
//   card?.classList.toggle('active');
// }
//   /**
//    * Toggle show all/less for a specific section
//    */
//   toggleShowAll(programId: string, section: SectionKey): void {
//     if (!this.showAll[programId]) {
//       this.showAll[programId] = { core: false, alternative: false, recommendations: false };
//     }
//     this.showAll[programId][section] = !this.showAll[programId][section];
//   }




//   /**
//    * Check if show all is enabled for a section
//    */
//   isShowingAll(programId: string, section: SectionKey): boolean {
//     return this.showAll[programId]?.[section] ?? false;
//   }

//   /**
//    * Main parsing function - converts recommendation text to structured data
//    */
//   parseRecommendation(text: string): RecommendationSections {
//     if (!text) return { core: [], alternative: [], recommendations: [] };

//     const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
//     const sections: RecommendationSections = {
//       core: [],
//       alternative: [],
//       recommendations: []
//     };

//     let currentSection: SectionKey | null = null;

//     for (const line of lines) {
//       // Detect section headers
//       if (line.includes('📚 CORE SUBJECTS')) {
//         currentSection = 'core';
//         continue;
//       }
//       if (line.includes('🔄 ALTERNATIVE REQUIREMENTS')) {
//         currentSection = 'alternative';
//         continue;
//       }
//       if (line.includes('💡 RECOMMENDATIONS')) {
//         currentSection = 'recommendations';
//         continue;
//       }

//       // Skip header lines
//       if (line.startsWith('⚠️') || line.startsWith('📚') || 
//           line.startsWith('🔄') || line.startsWith('💡')) {
//         continue;
//       }

//       // Parse and add to appropriate section
//       if (currentSection === 'core' || currentSection === 'alternative') {
//         const parsed = this.parseLine(line);
//         if (parsed) {
//           sections[currentSection].push(parsed);
//         }
//       } else if (currentSection === 'recommendations') {
//         const cleanLine = line.replace(/^[📋⭐]\s*/, '').trim();
//         if (cleanLine) {
//           sections.recommendations.push(cleanLine);
//         }
//       }
//     }

//     return sections;
//   }

//   /**
//    * Get visible items for a section with show all/less handling
//    */
//   getVisibleItems(
//     sections: RecommendationSections,
//     section: 'core' | 'alternative',
//     programId: string,
//     limit: number = 3
//   ): ParsedLine[] {
//     const items = sections[section] || [];
//     const expanded = this.isShowingAll(programId, section);
//     return expanded ? items : items.slice(0, limit);
//   }

//   /**
//    * Get visible recommendations with show all/less handling
//    */
//   getVisibleRecommendations(
//     sections: RecommendationSections,
//     programId: string,
//     limit: number = 3
//   ): string[] {
//     const items = sections.recommendations || [];
//     const expanded = this.isShowingAll(programId, 'recommendations');
//     return expanded ? items : items.slice(0, limit);
//   }

//   /**
//    * Check if section has more items than the limit
//    */
//   hasMoreItems(
//     sections: RecommendationSections,
//     section: SectionKey,
//     limit: number = 3
//   ): boolean {
//     if (section === 'recommendations') {
//       return sections.recommendations.length > limit;
//     }
//     return sections[section].length > limit;
//   }

//   /**
//    * Parse individual line into structured data
//    */
//   private parseLine(line: string): ParsedLine | null {
//     // Remove emoji prefix
//     const cleanLine = line.replace(/^[✅❌]\s*/, '').trim();
    
//     if (!cleanLine) return null;

//     // Determine status from emoji and content
//     const status = this.getLineStatus(line);

//     // Pattern 1: Subject with grades - "MATHEMATICS(CORE): B2 (Required: C5) - Excellent!"
//     const gradePattern = /^([^:]+):\s*([A-D]\d+)\s*\(Required:\s*([A-D]\d+)\)\s*-\s*(.+)$/;
//     const gradeMatch = cleanLine.match(gradePattern);
    
//     if (gradeMatch) {
//       return {
//         status,
//         subject: gradeMatch[1].trim(),
//         yourGrade: gradeMatch[2].trim(),
//         requirement: gradeMatch[3].trim(),
//         remarks: gradeMatch[4].trim(),
//         originalLine: line
//       };
//     }

//     // Pattern 2: Missing subject - "ENGLISH LANGUAGE: Missing (Required: C5)"
//     const missingPattern = /^([^:]+):\s*Missing\s*\(Required:\s*([A-D]\d+)\)$/;
//     const missingMatch = cleanLine.match(missingPattern);
    
//     if (missingMatch) {
//       return {
//         status,
//         subject: missingMatch[1].trim(),
//         requirement: missingMatch[2].trim(),
//         remarks: 'Missing',
//         originalLine: line
//       };
//     }

//     // Pattern 3: Group requirements - "No matching subjects found in group: [...]"
//     const groupPattern = /No matching subjects found in group:\s*\[([^\]]+)\]/;
//     const groupMatch = cleanLine.match(groupPattern);
    
//     if (groupMatch) {
//       return {
//         status,
//         subject: 'Group Requirement',
//         remarks: `No match in: ${groupMatch[1].trim()}`,
//         originalLine: line
//       };
//     }

//     // Pattern 4: Alternative anyOf
//     if (cleanLine.includes('Alternative') && cleanLine.includes('anyOf')) {
//       return {
//         status,
//         subject: 'Alternative Requirement',
//         remarks: cleanLine,
//         originalLine: line
//       };
//     }

//     // Default: treat entire line as subject with general remark
//     return {
//       status,
//       subject: cleanLine,
//       remarks: '',
//       originalLine: line
//     };
//   }

//   /**
//    * Determine status from line content
//    */
//   private getLineStatus(line: string): 'pass' | 'fail' | 'excellent' | 'neutral' {
//     if (line.startsWith('✅')) {
//       if (line.includes('Excellent!')) return 'excellent';
//       return 'pass';
//     }
//     if (line.startsWith('❌')) return 'fail';
//     return 'neutral';
//   }

//   /**
//    * Get status icon HTML for display
//    */
//   getStatusIcon(parsedLine: ParsedLine): string {
//     switch (parsedLine.status) {
//       case 'pass':
//         return '✅';
//       case 'excellent':
//         return '✅';
//       case 'fail':
//         return '❌';
//       default:
//         return 'ℹ️';
//     }
//   }

//   /**
//    * Get status icon from raw line (backward compatibility)
//    */
//   getStatusIconFromLine(line: string): string {
//     const icons = ['✅', '⚠️', '❌', '🎯', '⭐', '📋'];
//     return icons.find(icon => line.startsWith(icon)) || '';
//   }

//   /**
//    * Extract subject from raw line (backward compatibility)
//    */
//   extractSubject(line: string): string {
//     const subjectMatch = line.match(/^[✅⚠️❌🎯⭐📋]+\s*(.*?):/);
//     if (subjectMatch) return subjectMatch[1].trim();
//     if (line.includes('group:')) {
//       const match = line.match(/\[(.*?)\]/);
//       return match ? `Group: ${match[1]}` : 'Unmatched group';
//     }
//     return line;
//   }

//   /**
//    * Extract remarks from raw line (backward compatibility)
//    */
//   extractRemarks(line: string): string {
//     const match = line.match(/\b([A-Z0-9]+)\b.*?\(Required:\s*([A-Z0-9]+)\)/);
//     if (match) {
//       const [, candidate, required] = match;
//       return `Your grade: ${candidate}, Required: ${required}`;
//     }
//     if (/Missing/i.test(line)) return 'Requirement not met';
//     if (/Excellent|Pass/i.test(line)) return 'Requirement satisfied';
//     if (/Does not meet requirement/i.test(line)) return 'Below requirement';
//     if (/No matching subjects found/i.test(line)) return 'No subjects in required group';
//     return '';
//   }

//   /**
//    * Get icon for recommendation items
//    */
//   getRecommendationIcon(recommendation: string): string {
//     if (recommendation.toLowerCase().includes('missing')) {
//       return '📋';
//     }
//     if (recommendation.toLowerCase().includes('strong') || 
//         recommendation.toLowerCase().includes('performance')) {
//       return '⭐';
//     }
//     return '💡';
//   }

//   /**
//    * Get CSS class for status
//    */
//   getStatusClass(status: string): string {
//     return `status-${status}`;
//   }

//   /**
//    * Legacy method for compatibility
//    */
//   splitRecommendationSections(recommendationText: string): {
//     core: string[];
//     alternative: string[];
//     recommendations: string[];
//   } {
//     if (!recommendationText) return { core: [], alternative: [], recommendations: [] };

//     const lines = recommendationText.split('\n').map(l => l.trim()).filter(Boolean);

//     const coreIndex = lines.findIndex(l => l.startsWith('📚'));
//     const altIndex = lines.findIndex(l => l.startsWith('🔄'));
//     const recIndex = lines.findIndex(l => l.startsWith('💡'));

//     const core = coreIndex !== -1 && altIndex !== -1
//       ? lines.slice(coreIndex + 1, altIndex)
//       : [];
//     const alternative = altIndex !== -1 && recIndex !== -1
//       ? lines.slice(altIndex + 1, recIndex)
//       : [];
//     const recommendations = recIndex !== -1
//       ? lines.slice(recIndex + 1)
//       : [];

//     return { core, alternative, recommendations };
//   }


























// NEW FILE TO EXTACT SECTIONS


// Section markers configuration
 SECTION_MARKERS = {
  CORE_HEADER: '[CORE_SUBJECTS]',
  ALTERNATIVE_HEADER: '[ALTERNATIVE_REQUIREMENTS]',
  RECOMMENDATIONS_HEADER: '[RECOMMENDATIONS]',
  PASS: '[PASS]',
  FAIL: '[FAIL]',
  INFO: '[INFO]',
  EXCELLENT: '[EXCELLENT]'
}



activeCardId: number | null = null;
  showAll: Record<string, Record<SectionKey, boolean>> = {};
  showAllElegiblity: Record<string, Record<SectionElegibleKey, boolean>> = {};

  isCardActive(programId: number): boolean {
    return this.activeCardId === programId;
  }

  toggleShowAllEligible(programId: string, section: SectionElegibleKey): void {
    if (!this.showAllElegiblity[programId]) {
      this.showAllElegiblity[programId] = { core: false, eligibility: false, recommendations: false };
    }
    this.showAllElegiblity[programId][section] = !this.showAllElegiblity[programId][section];
  }

  toggleCard(event: Event) {
    const card = (event.target as HTMLElement).closest('.eligibility-card');
    card?.classList.toggle('active');
  }

  toggleShowAll(programId: string, section: SectionKey): void {
    if (!this.showAll[programId]) {
      this.showAll[programId] = { core: false, alternative: false, recommendations: false };
    }
    this.showAll[programId][section] = !this.showAll[programId][section];
  }

  isShowingAll(programId: string, section: SectionKey): boolean {
    return this.showAll[programId]?.[section] ?? false;
  }

  /**
   * Main parsing function - converts recommendation text to structured data
   * Handles both emoji-free markers and corrupted emoji responses
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
      // Detect section headers (support both text markers and keyword detection)
      if (this.isCoreSection(line)) {
        currentSection = 'core';
        continue;
      }
      if (this.isAlternativeSection(line)) {
        currentSection = 'alternative';
        continue;
      }
      if (this.isRecommendationsSection(line)) {
        currentSection = 'recommendations';
        continue;
      }

      // Skip header lines (markers, corrupted emojis, or section titles)
      if (this.isHeaderLine(line)) {
        continue;
      }

      // Parse and add to appropriate section
      if (currentSection === 'core' || currentSection === 'alternative') {
        const parsed = this.parseLine(line);
        if (parsed) {
          sections[currentSection].push(parsed);
        }
      } else if (currentSection === 'recommendations') {
        const cleanLine = this.cleanRecommendationLine(line);
        if (cleanLine) {
          sections.recommendations.push(cleanLine);
        }
      }
    }

    return sections;
  }

  /**
   * Check if line is a core subjects section header
   */
  private isCoreSection(line: string): boolean {
    return line.includes(this.SECTION_MARKERS.CORE_HEADER) ||
           line.includes('CORE SUBJECTS ANALYSIS') ||
           line.includes('CORE SUBJECTS') ||
           /^[??🎯📚]\s*CORE/i.test(line);
  }

  /**
   * Check if line is an alternative requirements section header
   */
  private isAlternativeSection(line: string): boolean {
    return line.includes(this.SECTION_MARKERS.ALTERNATIVE_HEADER) ||
           line.includes('ALTERNATIVE REQUIREMENTS') ||
           /^[??🔄]\s*ALTERNATIVE REQUIREMENTS/i.test(line);
  }

  /**
   * Check if line is a recommendations section header
   */
  private isRecommendationsSection(line: string): boolean {
    return line.includes(this.SECTION_MARKERS.RECOMMENDATIONS_HEADER) ||
           line.includes('RECOMMENDATIONS:') ||
           /^[??💡]\s*RECOMMENDATIONS/i.test(line);
  }

  /**
   * Check if line is a header (should be skipped)
   */
  private isHeaderLine(line: string): boolean {
    // Text markers
    if (line.startsWith('[') && line.includes(']') && !line.includes(':')) {
      return true;
    }
    
    // Corrupted emojis or actual emojis at start of section headers
    if (/^[??⚠️📚🔄💡🎯⭐📋]\s*[A-Z\s]+:?\s*$/.test(line)) {
      return true;
    }
    
    // Status/percentage lines
    if (/^[??⚠️]\s*(ELIGIBLE|ALTERNATIVE|NOT ELIGIBLE)/i.test(line)) {
      return true;
    }
    
    return false;
  }

  /**
   * Clean recommendation line by removing markers and corrupted emojis
   */
  private cleanRecommendationLine(line: string): string {
    return line
      .replace(/^\?\?\s*/, '') // Remove corrupted emojis
      .replace(/^\[(?:PASS|FAIL|INFO|EXCELLENT)\]\s*/, '') // Remove status markers
      .replace(/^[📋⭐💡]\s*/, '') // Remove emoji prefixes
      .trim();
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
    // Remove markers and corrupted emojis
    const cleanLine = line
      .replace(/^\?\?\s*/, '')
      .replace(/^\?\s*/, '')
      .replace(/^\[(?:PASS|FAIL|INFO|EXCELLENT)\]\s*/, '')
      .replace(/^[✅❌ℹ️]\s*/, '')
      .trim();
    
    if (!cleanLine) return null;

    // Determine status from markers or content
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
        status: 'fail',
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
        status: 'fail',
        subject: 'Group Requirement',
        remarks: `No match in: ${groupMatch[1].trim()}`,
        originalLine: line
      };
    }

    // Pattern 4: Alternative anyOf (success case)
    if (cleanLine.includes('Alternative') && cleanLine.includes('requirement met')) {
      return {
        status: 'pass',
        subject: 'Alternative Requirement',
        remarks: cleanLine,
        originalLine: line
      };
    }

    // Pattern 5: Alternative anyOf (failure case)
    if (cleanLine.includes('Alternative') && cleanLine.includes('anyOf')) {
      return {
        status: 'fail',
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
   * Determine status from line content (handles markers and content analysis)
   */
  private getLineStatus(line: string): 'pass' | 'fail' | 'excellent' | 'neutral' {
    // Check for text markers first
    if (line.includes('[EXCELLENT]') || line.includes('[PASS]') && line.includes('Excellent!')) {
      return 'excellent';
    }
    if (line.includes('[PASS]')) {
      return 'pass';
    }
    if (line.includes('[FAIL]')) {
      return 'fail';
    }
    
    // Handle corrupted emojis (assume ?? at start)
    const cleanLine = line.replace(/^\?\?\s*/, '');
    
    // Content-based detection
    if (cleanLine.includes('Excellent!') || cleanLine.includes('requirement met')) {
      return 'excellent';
    }
    if (cleanLine.includes('Missing') || 
        cleanLine.includes('Does not meet') || 
        cleanLine.includes('No matching subjects found')) {
      return 'fail';
    }
    if (cleanLine.match(/[A-D]\d+\s*\(Required:\s*[A-D]\d+\)/)) {
      // Has grade comparison - determine from comparison
      const match = cleanLine.match(/([A-D]\d+)\s*\(Required:\s*([A-D]\d+)\)/);
      if (match) {
        const [, yourGrade, required] = match;
        if (this.compareGrades(yourGrade, required) >= 0) {
          return cleanLine.includes('Excellent!') ? 'excellent' : 'pass';
        }
        return 'fail';
      }
    }
    
    return 'neutral';
  }

  /**
   * Compare two WASSCE grades (A1 is best, D7/E8/F9 are worst)
   * Returns: positive if grade1 is better, negative if worse, 0 if equal
   */
  private compareGrades(grade1: string, grade2: string): number {
    const gradeValues: Record<string, number> = {
      'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
      'D7': 7, 'E8': 8, 'F9': 9
    };
    
    const val1 = gradeValues[grade1] || 99;
    const val2 = gradeValues[grade2] || 99;
    
    return val2 - val1; // Lower number is better, so reverse
  }

  /**
   * Get status icon HTML for display
   */
  getStatusIcon(parsedLine: ParsedLine): string {
    switch (parsedLine.status) {
      case 'excellent':
        return '✅';
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      default:
        return 'ℹ️';
    }
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




}
