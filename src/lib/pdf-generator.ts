import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import type { CodeSubmission } from "@/lib/supabase";

export async function generateReviewsPDF() {
  try {
    // Fetch all required data
    const { data: submissions } = await supabase
      .from("code_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!submissions || submissions.length === 0) {
      throw new Error("No submissions found");
    }

    const typedData = submissions as CodeSubmission[];

    // Create a new PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Helper function to add content and handle page breaks
    const addContent = (height: number) => {
      if (yPosition + height > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      return yPosition;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text("TeamKronix Reviews Report", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // Gray color
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // ============ DASHBOARD STATS ============
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("1. Dashboard Summary", 20, yPosition);
    yPosition += 10;

    // Calculate stats
    const scores = typedData.filter((s) => s.score !== null).map((s) => s.score!);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const totalIssues = typedData.reduce((acc, s) => {
      const issues = s.issues_found as any[] | null;
      return acc + (issues?.length || 0);
    }, 0);

    const optimizations = typedData.filter((s) => s.optimized_code).length;

    // Stats table
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const statsData = [
      [`Total Reviews: ${typedData.length}`],
      [`Average Score: ${avgScore}/100`],
      [`Issues Found: ${totalIssues}`],
      [`Optimizations: ${optimizations}`],
    ];

    statsData.forEach((stat) => {
      if (addContent(8) + 8 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(stat[0], 25, yPosition);
      yPosition += 8;
    });

    yPosition += 8;

    // ============ ANALYTICS BY LANGUAGE ============
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("2. Language-Wise Analytics", 20, yPosition);
    yPosition += 10;

    // Group by language
    const languageGroups: Record<string, CodeSubmission[]> = {};
    typedData.forEach((submission) => {
      const lang = submission.language.toLowerCase();
      if (!languageGroups[lang]) {
        languageGroups[lang] = [];
      }
      languageGroups[lang].push(submission);
    });

    // Process each language
    Object.entries(languageGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([lang, subs]) => {
        if (addContent(20) + 20 > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        const langAvgScore = Math.round(
          subs.reduce((sum, s) => sum + (s.score || 0), 0) / (subs.length || 1)
        );

        const issueMap: Record<string, number> = {};
        subs.forEach((sub) => {
          const issues = sub.issues_found as any[];
          if (Array.isArray(issues)) {
            issues.forEach((issue) => {
              const type = issue.type || "unknown";
              issueMap[type] = (issueMap[type] || 0) + 1;
            });
          }
        });

        // Language header
        pdf.setFontSize(11);
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${lang.toUpperCase()} - Reviews: ${subs.length}, Avg Score: ${langAvgScore}/100`, 25, yPosition);
        yPosition += 7;

        // Top issues
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        const topIssues = Object.entries(issueMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        if (topIssues.length > 0) {
          pdf.text("Top Issues: " + topIssues.map(([type, count]) => `${type} (${count})`).join(", "), 25, yPosition);
        } else {
          pdf.text("No issues found", 25, yPosition);
        }
        yPosition += 8;
      });

    yPosition += 5;

    // ============ RECENT SUBMISSIONS ============
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("3. Recent Submissions", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    const recentSubmissions = typedData.slice(0, 10);

    recentSubmissions.forEach((submission, index) => {
      if (addContent(12) + 12 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      const date = new Date(submission.created_at).toLocaleDateString();
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${submission.language} - Score: ${submission.score}/100 (${date})`, 25, yPosition);
      
      // Code snippet (truncated)
      pdf.setTextColor(100, 116, 139);
      const codeSnippet = submission.original_code.substring(0, 60) + "...";
      pdf.text(codeSnippet, 25, yPosition + 5, { maxWidth: 160 });
      
      yPosition += 12;
    });

    // Save PDF
    pdf.save(`TeamKronix-Reviews-${new Date().getTime()}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
