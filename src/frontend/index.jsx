import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box,
  Button,
  Heading,
  Inline,
  Label,
  Lozenge,
  Select,
  Spinner,
  Stack,
  Text,
  Textfield
} from '@forge/react';
import { invoke } from '@forge/bridge';
import {
  PROBABILITY_OPTIONS,
  SEVERITY_OPTIONS,
  evaluateSafetyRisk
} from '../riskMatrix';

const App = () => {
  const [severity, setSeverity] = useState(SEVERITY_OPTIONS[0].value);
  const [probability, setProbability] = useState(PROBABILITY_OPTIONS[0].value);
  const [mitigation, setMitigation] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    invoke('getAssessment')
      .then((saved) => {
        if (saved) {
          if (saved.severity) setSeverity(saved.severity);
          if (saved.probability) setProbability(saved.probability);
          if (saved.mitigation) setMitigation(saved.mitigation);
          if (saved.updatedAt) setLastSaved(saved.updatedAt);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const evaluation = evaluateSafetyRisk(severity, probability, mitigation);

  const getRiskLozengeAppearance = (riskLevel) => {
    if (riskLevel === 'LOW') return 'success';
    if (riskLevel === 'MEDIUM') return 'inprogress';
    return 'removed';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await invoke('saveAssessment', {
        severity,
        probability,
        mitigation,
        safetyClass: evaluation.safetyClass,
        riskLevel: evaluation.riskLevel,
        verdict: evaluation.verdict,
        clearedForRelease: evaluation.clearedForRelease
      });
      if (saved?.updatedAt) {
        setLastSaved(saved.updatedAt);
      }
    } finally {
      setIsSaving(false);
    }
  };

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
        <Heading as="h4">Patient Safety Assessment (IEC 62304)</Heading>

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
          <Label labelFor="probability-select">Occurrence Probability</Label>
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
          <Text>Risk:</Text>
          <Lozenge appearance={getRiskLozengeAppearance(evaluation.riskLevel)}>
            {evaluation.riskLevel}
          </Lozenge>
        </Inline>

        {evaluation.requiresMitigation && (
          <Box>
            <Label labelFor="mitigation-input">
              Risk Mitigation Plan (Mandatory)
            </Label>
            <Textfield
              id="mitigation-input"
              placeholder="e.g., Added hardware limiter and unit test verification"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
            />
          </Box>
        )}

        <Box>
          <Label>Release Status</Label>
          <Lozenge appearance={evaluation.clearedForRelease ? 'success' : 'removed'}>
            {evaluation.verdict}
          </Lozenge>
        </Box>

        <Inline space="space.150" alignBlock="center">
          <Button
            appearance="primary"
            isDisabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Assessment'}
          </Button>
          {lastSaved && (
            <Text>
              Saved: {new Date(lastSaved).toLocaleString()}
            </Text>
          )}
        </Inline>
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);