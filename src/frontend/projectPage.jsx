import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box,
  DynamicTable,
  EmptyState,
  Heading,
  Inline,
  Lozenge,
  Spinner,
  Stack,
  Text,
  User
} from '@forge/react';
import { invoke } from '@forge/bridge';

const getRiskLozengeAppearance = (riskLevel) => {
  if (riskLevel === 'LOW') return 'success';
  if (riskLevel === 'MEDIUM') return 'inprogress';
  return 'removed';
};

const REGISTER_HEAD = {
  cells: [
    { key: 'issue', content: 'Issue Key' },
    { key: 'class', content: 'Safety Class' },
    { key: 'risk', content: 'Initial -> Residual Risk' },
    { key: 'mitigation', content: 'Mitigation Plan' },
    { key: 'verdict', content: 'Release Verdict' },
    { key: 'user', content: 'Signed Off By' },
    { key: 'updated', content: 'Last Updated' }
  ]
};

const ProjectRegister = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    invoke('getProjectAssessments')
      .then((items) => {
        if (Array.isArray(items)) {
          setAssessments(items);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Box padding="space.200">
        <Inline space="space.100" alignBlock="center">
          <Spinner size="medium" />
          <Text>Loading project safety risk register...</Text>
        </Inline>
      </Box>
    );
  }

  if (assessments.length === 0) {
    return (
      <EmptyState
        header="No Safety Assessments Recorded Yet"
        description="Open any Jira issue in this project and save a Patient Safety Assessment to populate this compliance register."
      />
    );
  }

  const clearedCount = assessments.filter((a) => a.clearedForRelease).length;
  const blockedCount = assessments.length - clearedCount;

  const rows = assessments.map((item, idx) => ({
    key: `register-row-${item.issueKey || idx}`,
    cells: [
      {
        key: 'issue',
        content: <Text>{item.issueKey || 'Unknown'}</Text>
      },
      {
        key: 'class',
        content: <Lozenge appearance="new">{item.safetyClass}</Lozenge>
      },
      {
        key: 'risk',
        content: (
          <Inline space="space.050" alignBlock="center">
            <Lozenge appearance={getRiskLozengeAppearance(item.riskLevel)}>
              {item.riskLevel}
            </Lozenge>
            <Text>to</Text>
            <Lozenge
              appearance={getRiskLozengeAppearance(
                item.residualRiskLevel || item.riskLevel
              )}
            >
              {item.residualRiskLevel || item.riskLevel}
            </Lozenge>
          </Inline>
        )
      },
      {
        key: 'mitigation',
        content: <Text>{item.mitigation || 'None required'}</Text>
      },
      {
        key: 'verdict',
        content: (
          <Lozenge
            appearance={item.clearedForRelease ? 'success' : 'removed'}
          >
            {item.verdict}
          </Lozenge>
        )
      },
      {
        key: 'user',
        content: item.accountId ? (
          <User accountId={item.accountId} />
        ) : (
          <Text>System</Text>
        )
      },
      {
        key: 'updated',
        content: (
          <Text>
            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
          </Text>
        )
      }
    ]
  }));

  return (
    <Box padding="space.200">
      <Stack space="space.200">
        <Heading as="h3">
          IEC 62304 / ISO 14971 Project Safety Risk Register
        </Heading>

        <Inline space="space.200" alignBlock="center">
          <Inline space="space.050" alignBlock="center">
            <Text>Total Assessed Issues:</Text>
            <Lozenge>{assessments.length}</Lozenge>
          </Inline>
          <Inline space="space.050" alignBlock="center">
            <Text>Cleared for Release:</Text>
            <Lozenge appearance="success">{clearedCount}</Lozenge>
          </Inline>
          <Inline space="space.050" alignBlock="center">
            <Text>Release Blocked:</Text>
            <Lozenge appearance="removed">{blockedCount}</Lozenge>
          </Inline>
        </Inline>

        <DynamicTable head={REGISTER_HEAD} rows={rows} />
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <ProjectRegister />
  </React.StrictMode>
);