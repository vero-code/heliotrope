import { kvs } from '@forge/kvs';

// Blocks workflow transition
export const validateReleaseGate = async ({ issue }) => {
  const issueId = issue?.id;
  const record = issueId ? await kvs.get(`risk-assessment-${issueId}`) : null;

  if (!record) {
    return {
      result: false,
      errorMessage:
        'Heliotrope Safety Gate: Complete the IEC 62304 Patient Safety Assessment before closing this issue.'
    };
  }

  if (!record.clearedForRelease) {
    return {
      result: false,
      errorMessage: `Heliotrope Safety Gate: ${record.verdict}. Provide a valid Risk Mitigation Plan before release.`
    };
  }

  return { result: true };
};