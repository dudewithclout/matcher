import type { StructuredProfileOutput } from "../../shared/profile-schema";

import { claudeService } from "./claude";
import type { InterviewSession } from "../../shared/types";

export class ProfileExtractorService {
  async updateSessionProfile(session: InterviewSession): Promise<StructuredProfileOutput> {
    return claudeService.extractProfile(session);
  }
}

export const profileExtractorService = new ProfileExtractorService();
