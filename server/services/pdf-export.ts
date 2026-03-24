import PDFDocument from "pdfkit";

import type { MatchResult, StructuredProfile } from "../../shared/types";

export class PdfExportService {
  export(profile: StructuredProfile, matches: MatchResult[]) {
    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({ margin: 48 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(24).text("College Matcher Results");
      doc.moveDown();
      doc.fontSize(14).text("Profile Snapshot", { underline: true });
      doc.fontSize(11);
      doc.text(`Intended majors: ${profile.intended_majors.join(", ") || "Not specified"}`);
      doc.text(`Personality traits: ${profile.personality_traits.join(", ") || "Not specified"}`);
      doc.text(`Preferred school size: ${profile.preferred_school_size}`);
      doc.text(`Preferred setting: ${profile.preferred_setting}`);
      doc.text(`Location preferences: ${profile.location_preferences.join(", ") || "Not specified"}`);
      doc.text(`Budget range: ${profile.budget_range}`);
      doc.text(`Academic strength: ${profile.academic_strength}`);
      doc.text(`Career goals: ${profile.career_goals.join(", ") || "Not specified"}`);
      doc.moveDown();
      doc.fontSize(14).text("Top Matches", { underline: true });
      doc.moveDown(0.5);

      matches.slice(0, 10).forEach((match, index) => {
        doc.fontSize(12).text(`${index + 1}. ${match.college.name} — ${Math.round(match.score * 100)}% match`);
        doc.fontSize(10).text(`Why it fits: ${match.whyItFits.join(" ")}`);
        doc.text(`Setting: ${match.college.setting}, Size: ${match.college.size}, Cost: $${match.college.estimatedCost.toLocaleString()}`);
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }
}

export const pdfExportService = new PdfExportService();
