export const SEVERITY_OPTIONS = [
  { label: 'Negligible (No health injury)', value: 'NEGLIGIBLE' },
  { label: 'Moderate (Reversible injury / delayed care)', value: 'MODERATE' },
  { label: 'Critical (Permanent injury or life-threatening)', value: 'CRITICAL' }
];

export const PROBABILITY_OPTIONS = [
  { label: 'Rare (Unlikely to occur)', value: 'RARE' },
  { label: 'Possible (Occasional occurrence)', value: 'POSSIBLE' },
  { label: 'Frequent (Regular occurrence)', value: 'FREQUENT' }
];

// IEC 62304 / ISO 14971 safety risk matrix
const RISK_MATRIX = {
  NEGLIGIBLE: {
    RARE: { safetyClass: 'Class A', riskLevel: 'LOW' },
    POSSIBLE: { safetyClass: 'Class A', riskLevel: 'LOW' },
    FREQUENT: { safetyClass: 'Class B', riskLevel: 'MEDIUM' }
  },
  MODERATE: {
    RARE: { safetyClass: 'Class A', riskLevel: 'LOW' },
    POSSIBLE: { safetyClass: 'Class B', riskLevel: 'MEDIUM' },
    FREQUENT: { safetyClass: 'Class C', riskLevel: 'HIGH' }
  },
  CRITICAL: {
    RARE: { safetyClass: 'Class B', riskLevel: 'MEDIUM' },
    POSSIBLE: { safetyClass: 'Class C', riskLevel: 'HIGH' },
    FREQUENT: { safetyClass: 'Class C', riskLevel: 'HIGH' }
  }
};

export function evaluateSafetyRisk(severity, probability, mitigation = '') {
  const row = RISK_MATRIX[severity] || RISK_MATRIX.NEGLIGIBLE;
  const assessment = row[probability] || row.RARE;

  const requiresMitigation = assessment.riskLevel !== 'LOW';
  const hasMitigation = mitigation.trim().length > 0;
  const clearedForRelease = !requiresMitigation || hasMitigation;

  return {
    safetyClass: assessment.safetyClass,
    riskLevel: assessment.riskLevel,
    requiresMitigation,
    clearedForRelease,
    verdict: clearedForRelease
      ? 'Cleared for Release'
      : 'Release Blocked: Mitigation Required'
  };
}