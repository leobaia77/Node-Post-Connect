import evidenceData from "../data/evidence-library.json";

export interface RecommendationTemplate {
  condition: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface Evidence {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  applicable_goals: string[];
  recommendation_templates: RecommendationTemplate[];
}

export interface EvidenceSearchQuery {
  goals?: string[];
  categories?: string[];
  condition?: string;
}

const evidenceLibrary: Evidence[] = evidenceData.evidence as Evidence[];

export function searchEvidence(query: EvidenceSearchQuery): Evidence[] {
  let results = [...evidenceLibrary];

  if (query.categories && query.categories.length > 0) {
    results = results.filter(e => 
      query.categories!.includes(e.category)
    );
  }

  if (query.goals && query.goals.length > 0) {
    results = results.filter(e => 
      e.applicable_goals.some(goal => query.goals!.includes(goal))
    );
  }

  if (query.condition) {
    results = results.filter(e =>
      e.recommendation_templates.some(t => t.condition === query.condition)
    );
  }

  return results;
}

export function getEvidenceById(id: string): Evidence | undefined {
  return evidenceLibrary.find(e => e.id === id);
}

export function getEvidenceByCategory(category: string): Evidence[] {
  return evidenceLibrary.filter(e => e.category === category);
}

export function getEvidenceByGoal(goal: string): Evidence[] {
  return evidenceLibrary.filter(e => e.applicable_goals.includes(goal));
}

export function getRecommendationForCondition(
  condition: string,
  variables?: Record<string, string>
): { evidence: Evidence; template: RecommendationTemplate; action: string } | null {
  for (const evidence of evidenceLibrary) {
    const template = evidence.recommendation_templates.find(t => t.condition === condition);
    if (template) {
      let action = template.action;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          action = action.replace(`{${key}}`, value);
        }
      }
      return { evidence, template, action };
    }
  }
  return null;
}

export function getAllCategories(): string[] {
  return Array.from(new Set(evidenceLibrary.map(e => e.category)));
}

export function getAllGoals(): string[] {
  const goals = new Set<string>();
  evidenceLibrary.forEach(e => e.applicable_goals.forEach(g => goals.add(g)));
  return Array.from(goals);
}

export function formatEvidenceForLLM(evidence: Evidence[]): string {
  return evidence.map(e => 
    `[${e.id}] ${e.title}\n` +
    `Summary: ${e.summary}\n` +
    `Source: ${e.source} (${e.source_url})\n` +
    `Applicable Goals: ${e.applicable_goals.join(", ")}`
  ).join("\n\n");
}

export { evidenceLibrary };
