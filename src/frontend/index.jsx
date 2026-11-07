import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box,
  Button,
  DynamicTable,
  Heading,
  Inline,
  Label,
  Lozenge,
  Select,
  Spinner,
  Stack,
  Text,
  Textfield,
  User
} from '@forge/react';
import { invoke } from '@forge/bridge';
import {
  PROBABILITY_OPTIONS,
  SEVERITY_OPTIONS,
  evaluateSafetyRisk
} from '../riskMatrix';
import { syncAssessmentToJira } from './jiraSync';

const getRiskLozengeAppearance = (riskLevel) => {
  if (riskLevel === 'LOW') return 'success';
  if (riskLevel === 'MEDIUM') return 'inprogress';
  return 'removed';
};

const AUDIT_TABLE_HEAD = {
  cells: [
    { key: 'date', content: 'Timestamp' },
    { key: 'user', content: 'Assessed By' },
    { key: 'class', content: 'Class' },
    { key: 'risk', content: 'Initial -> Residual' },
    { key: 'verdict', content: 'Verdict' }
  ]
};

const App = () => {
  const [severity, setSeverity] = useState(SEVERITY_OPTIONS[0].value);
  const [probability, setProbability] = useState(PROBABILITY_OPTIONS[0].value);
  const [residualProbability, setResidualProbability] = useState(
    PROBABILITY_OPTIONS[0].value
  );
  const [mitigation, setMitigation] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [assessedBy, setAssessedBy] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    invoke('getAssessment')
      .then((saved) => {
        if (saved) {
          if (saved.severity) setSeverity(saved.severity);
          if (saved.probability) setProbability(saved.probability);
          if (saved.residualProbability) {
            setResidualProbability(saved.residualProbability);
          }
          if (typeof saved.mitigation === 'string') {
            setMitigation(saved.mitigation);
          }
          if (saved.updatedAt) setLastSaved(saved.updatedAt);
          if (saved.accountId) setAssessedBy(saved.accountId);
          if (Array.isArray(saved.history)) setHistory(saved.history);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const evaluation = evaluateSafetyRisk(
    severity,
    probability,
    mitigation,
    residualProbability
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        severity,
        probability,
        residualProbability,
        mitigation,
        safetyClass: evaluation.safetyClass,
        riskLevel: evaluation.riskLevel,
        residualRiskLevel: evaluation.residualRiskLevel,
        verdict: evaluation.verdict,
        clearedForRelease: evaluation.clearedForRelease
      };

      const saved = await invoke('saveAssessment', payload);
      await syncAssessmentToJira(payload);

      if (saved) {
        if (saved.updatedAt) setLastSaved(saved.updatedAt);
        if (saved.accountId) setAssessedBy(saved.accountId);
        if (Array.isArray(saved.history)) setHistory(saved.history);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const auditRows = history.map((entry, index) => ({
    key: `audit-row-${index}-${entry.updatedAt}`,
    cells: [
      {
        key: 'date',
        content: new Date(entry.updatedAt).toLocaleString()
      },
      {
        key: 'user',
        content: entry.accountId ? (
          <User accountId={entry.accountId} />
        ) : (
          <Text>System</Text>
        )
      },
      {
        key: 'class',
        content: <Lozenge appearance="new">{entry.safetyClass}</Lozenge>
      },
      {
        key: 'risk',
        content: (
          <Inline space="space.050" alignBlock="center">
            <Lozenge appearance={getRiskLozengeAppearance(entry.riskLevel)}>
              {entry.riskLevel}
            </Lozenge>
            <Text>to</Text>
            <Lozenge
              appearance={getRiskLozengeAppearance(
                entry.residualRiskLevel || entry.riskLevel
              )}
            >
              {entry.residualRiskLevel || entry.riskLevel}
            </Lozenge>
          </Inline>
        )
      },
      {
        key: 'verdict',
        content: (
          <Lozenge
            appearance={
              entry.verdict === 'Cleared for Release' ? 'success' : 'removed'
            }
          >
            {entry.verdict}
          </Lozenge>
        )
      }
    ]
  }));

  if (isLoading) {
    return (
      <Box padding="space.150">
        <Inline space="space.100" alignBlock="center">
          <Spinner size="small" />
          <Text>Loading safety assessment...</Text>
        </Inline>
      </Box>
    );
  }

  return (
    <Box padding="space.150">
      <Stack space="space.150">
        <Heading as="h4">Patient Safety Assessment (IEC 62304 / ISO 14971)</Heading>

        <Box>
          <Label labelFor="severity-select">Harm Severity</Label>
          <Select
            id="severity-select"
            options={SEVERITY_OPTIONS}
            value={SEVERITY_OPTIONS.find((opt) => opt.value === severity)}
            onChange={(selected) => setSeverity(selected?.value || selected)}
          />
        </Box>

        <Box>
          <Label labelFor="probability-select">Initial Occurrence Probability</Label>
          <Select
            id="probability-select"
            options={PROBABILITY_OPTIONS}
            value={PROBABILITY_OPTIONS.find((opt) => opt.value === probability)}
            onChange={(selected) => setProbability(selected?.value || selected)}
          />
        </Box>

        <Inline space="space.100" alignBlock="center">
          <Text>Safety Class:</Text>
          <Lozenge appearance="new">{evaluation.safetyClass}</Lozenge>
          <Text>Initial Risk:</Text>
          <Lozenge appearance={getRiskLozengeAppearance(evaluation.riskLevel)}>
            {evaluation.riskLevel}
          </Lozenge>
        </Inline>

        {evaluation.requiresMitigation && (
          <Stack space="space.150">
            <Box>
              <Label labelFor="mitigation-input">
                Risk Control / Mitigation Plan (Mandatory)
              </Label>
              <Textfield
                id="mitigation-input"
                placeholder="e.g., Added hardware dosage limiter and unit test verification"
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
              />
            </Box>

            <Box>
              <Label labelFor="residual-probability-select">
                Post-Mitigation (Residual) Probability
              </Label>
              <Select
                id="residual-probability-select"
                options={PROBABILITY_OPTIONS}
                value={PROBABILITY_OPTIONS.find(
                  (opt) => opt.value === residualProbability
                )}
                onChange={(selected) =>
                  setResidualProbability(selected?.value || selected)
                }
              />
            </Box>

            <Inline space="space.100" alignBlock="center">
              <Text>Residual Risk:</Text>
              <Lozenge
                appearance={getRiskLozengeAppearance(
                  evaluation.residualRiskLevel
                )}
              >
                {evaluation.residualRiskLevel}
              </Lozenge>
            </Inline>
          </Stack>
        )}

        <Inline space="space.100" alignBlock="center">
          <Text>Release Verdict:</Text>
          <Lozenge
            appearance={evaluation.clearedForRelease ? 'success' : 'removed'}
          >
            {evaluation.verdict}
          </Lozenge>
        </Inline>

        <Inline space="space.150" alignBlock="center">
          <Button
            appearance="primary"
            isDisabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Sign Off & Save'}
          </Button>
          {lastSaved && (
            <Inline space="space.100" alignBlock="center">
              <Text>
                Signed off {new Date(lastSaved).toLocaleString()}
                {assessedBy ? ' by' : ''}
              </Text>
              {assessedBy && <User accountId={assessedBy} />}
            </Inline>
          )}
        </Inline>

        {auditRows.length > 0 && (
          <Box>
            <Heading as="h5">Compliance Audit Trail</Heading>
            <DynamicTable head={AUDIT_TABLE_HEAD} rows={auditRows} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);