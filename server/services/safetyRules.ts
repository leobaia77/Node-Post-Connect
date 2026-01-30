/**
 * Safety Rules for Teen Health Monitoring
 * 
 * IMPORTANT SAFETY NOTES:
 * - Never use shame-based language
 * - Always frame as supportive, not punitive
 * - Include "consult a professional" messaging for health concerns
 * - The app provides guidance, not medical diagnosis
 * - Respect teen privacy for certain alerts (stress, mood)
 */

export type AlertType = 
  | 'sleep_deficit'
  | 'training_spike'
  | 'pain_flag'
  | 'low_intake'
  | 'overtraining'
  | 'low_energy'
  | 'high_stress'
  | 'restrictive_eating';

export type Severity = 'info' | 'warning' | 'critical';

export interface SafetyRule {
  id: AlertType;
  name: string;
  description: string;
  severity: Severity;
  shareWithParent: boolean;
  getMessage: (params: Record<string, unknown>) => string;
  resourceLink?: string;
}

export const SAFETY_RULES: SafetyRule[] = [
  {
    id: 'sleep_deficit',
    name: 'Sleep Deficit Detection',
    description: '3+ consecutive nights below minimum sleep target',
    severity: 'warning',
    shareWithParent: true,
    getMessage: (params) => {
      const nights = params.nights || 3;
      const avgHours = params.avgHours || 'unknown';
      const targetHours = params.targetHours || 8;
      return `Sleep has been below ${targetHours} hours for ${nights} nights (averaging ${avgHours} hours). Adequate sleep (8-10 hours) is essential for teen development, athletic performance, and recovery. Consider adjusting bedtime routines or reducing screen time before bed.`;
    },
  },
  {
    id: 'training_spike',
    name: 'Sudden Training Spike',
    description: 'Weekly training minutes > 150% of 4-week average',
    severity: 'warning',
    shareWithParent: true,
    getMessage: (params) => {
      const percentIncrease = params.percentIncrease || 150;
      return `Training volume increased ${percentIncrease}% compared to your recent average. Gradual progression helps reduce injury risk. Consider adding extra recovery time or spacing out intense sessions.`;
    },
  },
  {
    id: 'pain_flag',
    name: 'Pain Flag Alert',
    description: 'Pain reported in check-ins',
    severity: 'info',
    shareWithParent: true,
    getMessage: (params) => {
      const count = params.count || 1;
      const days = params.days || 7;
      if (count >= 3) {
        return `Pain has been reported ${count} times in the last ${days} days. Recurring pain may indicate an injury that needs attention. If pain persists, consider consulting a healthcare provider or athletic trainer.`;
      }
      return `Pain was reported in a recent check-in. Take note of when and where it occurs. If pain continues or worsens, consider consulting a healthcare provider.`;
    },
  },
  {
    id: 'low_energy',
    name: 'Very Low Energy Pattern',
    description: 'Energy level ≤ 2 for 3+ consecutive days',
    severity: 'warning',
    shareWithParent: true,
    getMessage: (params) => {
      const days = params.days || 3;
      return `Energy levels have been low for ${days} consecutive days. This could indicate inadequate recovery, nutrition, or sleep. Consider taking a rest day, reviewing sleep habits, and ensuring you're eating enough to fuel your activity.`;
    },
  },
  {
    id: 'high_stress',
    name: 'High Stress Pattern',
    description: 'Stress level ≥ 4 for 5+ days in a 7-day window',
    severity: 'info',
    shareWithParent: false,
    getMessage: (params) => {
      const days = params.days || 5;
      return `Stress has been elevated for ${days} of the last 7 days. It's normal to feel stressed sometimes, but ongoing stress can affect your health and performance. Consider talking to someone you trust, trying relaxation techniques, or taking breaks when needed.`;
    },
  },
  {
    id: 'restrictive_eating',
    name: 'Signs of Restrictive Eating',
    description: 'Very low calorie intake with high training and/or weight loss goals',
    severity: 'critical',
    shareWithParent: true,
    getMessage: () => {
      return `Your eating patterns and training load may need attention. Growing bodies, especially active ones, need adequate fuel. Eating enough supports your performance, recovery, and overall health. Consider speaking with a healthcare provider or registered dietitian who understands teen athletes.`;
    },
    resourceLink: 'https://www.nationaleatingdisorders.org/help-support/contact-helpline',
  },
  {
    id: 'overtraining',
    name: 'Overtraining Indicators',
    description: 'High training load + low energy + high soreness',
    severity: 'warning',
    shareWithParent: true,
    getMessage: () => {
      return `Your body may be showing signs of overtraining: high training load combined with low energy and high soreness. Rest is when your body gets stronger. Consider taking a recovery day, reducing intensity, and prioritizing sleep.`;
    },
  },
  {
    id: 'low_intake',
    name: 'Low Nutritional Intake',
    description: 'Very low calorie intake for multiple days',
    severity: 'warning',
    shareWithParent: true,
    getMessage: (params) => {
      const avgCalories = params.avgCalories || 'low';
      return `Logged calorie intake has been ${avgCalories} for several days. Active teens typically need 2000-3000+ calories daily. Make sure you're eating enough to support your training and growth. If you're unsure about your nutrition, consider talking to a registered dietitian.`;
    },
  },
];

export function getRule(alertType: AlertType): SafetyRule | undefined {
  return SAFETY_RULES.find(rule => rule.id === alertType);
}

export function getRuleSeverity(alertType: AlertType, params?: Record<string, unknown>): Severity {
  const rule = getRule(alertType);
  if (!rule) return 'info';
  
  if (alertType === 'pain_flag' && params?.count && Number(params.count) >= 3) {
    return 'warning';
  }
  
  return rule.severity;
}
