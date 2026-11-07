import Resolver from '@forge/resolver';
import { kvs, WhereConditions } from '@forge/kvs';

const resolver = new Resolver();
const MAX_HISTORY_ENTRIES = 10;

resolver.define('getAssessment', async ({ context }) => {
  const issueId = context?.extension?.issue?.id || 'default-issue';
  const data = await kvs.get(`risk-assessment-${issueId}`);
  return data || null;
});

resolver.define('saveAssessment', async ({ payload, context }) => {
  const issueId = context?.extension?.issue?.id || 'default-issue';
  const issueKey = context?.extension?.issue?.key || '';
  const accountId = context?.accountId || null;
  const updatedAt = new Date().toISOString();

  const existing = (await kvs.get(`risk-assessment-${issueId}`)) || {};
  const previousHistory = Array.isArray(existing.history) ? existing.history : [];

  const auditEntry = {
    updatedAt,
    accountId,
    safetyClass: payload.safetyClass,
    riskLevel: payload.riskLevel,
    residualRiskLevel: payload.residualRiskLevel,
    verdict: payload.verdict,
    mitigation: payload.mitigation || ''
  };

  const history = [auditEntry, ...previousHistory].slice(0, MAX_HISTORY_ENTRIES);

  const record = {
    ...payload,
    issueKey,
    accountId,
    updatedAt,
    history
  };

  await kvs.set(`risk-assessment-${issueId}`, record);
  return record;
});

// Fetch all assessments
resolver.define('getProjectAssessments', async ({ context }) => {
  const projectKey = context?.extension?.project?.key || '';
  const queryResult = await kvs
    .query()
    .where('key', WhereConditions.beginsWith('risk-assessment-'))
    .getMany();

  const items = (queryResult?.results || [])
    .map((entry) => entry.value)
    .filter(Boolean)
    .filter((item) =>
      projectKey && item.issueKey
        ? item.issueKey.startsWith(`${projectKey}-`)
        : true
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return items;
});

export const handler = resolver.getDefinitions();