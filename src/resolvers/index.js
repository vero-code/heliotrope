import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Fetch saved assessment for the current issue
resolver.define('getAssessment', async ({ context }) => {
  const issueId = context?.extension?.issue?.id || 'default-issue';
  const data = await storage.get(`risk-assessment-${issueId}`);
  return data || null;
});

// Save assessment for the current issue
resolver.define('saveAssessment', async ({ payload, context }) => {
  const issueId = context?.extension?.issue?.id || 'default-issue';
  const issueKey = context?.extension?.issue?.key || '';

  const record = {
    ...payload,
    issueKey,
    updatedAt: new Date().toISOString()
  };

  await storage.set(`risk-assessment-${issueId}`, record);
  return record;
});

export const handler = resolver.getDefinitions();