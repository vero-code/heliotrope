import { requestJira, view } from '@forge/bridge';

const HELIOTROPE_LABELS = new Set([
  'safety-class-a',
  'safety-class-b',
  'safety-class-c',
  'safety-cleared',
  'release-blocked'
]);

export async function syncAssessmentToJira(assessment) {
  const context = await view.getContext();
  const issueKey =
    context?.extension?.issue?.key || context?.extension?.issue?.id;

  if (!issueKey) {
    return;
  }

  await requestJira(
    `/rest/api/3/issue/${issueKey}/properties/heliotrope.safety`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        safetyClass: assessment.safetyClass,
        riskLevel: assessment.riskLevel,
        residualRiskLevel: assessment.residualRiskLevel,
        clearedForRelease: assessment.clearedForRelease,
        verdict: assessment.verdict,
        mitigation: assessment.mitigation || '',
        updatedAt: new Date().toISOString()
      })
    }
  );

  const issueResponse = await requestJira(
    `/rest/api/3/issue/${issueKey}?fields=labels`,
    {
      headers: { Accept: 'application/json' }
    }
  );

  if (!issueResponse.ok) {
    return;
  }

  const issueData = await issueResponse.json();
  const existingLabels = Array.isArray(issueData?.fields?.labels)
    ? issueData.fields.labels
    : [];

  const preservedLabels = existingLabels.filter(
    (label) => !HELIOTROPE_LABELS.has(label)
  );

  const classLabel = `safety-${assessment.safetyClass
    .toLowerCase()
    .replace(/\s+/g, '-')}`;
  const statusLabel = assessment.clearedForRelease
    ? 'safety-cleared'
    : 'release-blocked';

  const updatedLabels = [...preservedLabels, classLabel, statusLabel];

  await requestJira(`/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        labels: updatedLabels
      }
    })
  });
}