import { describe, it, expect } from 'vitest';
import { processStage1, processStage2 } from './pipeline';

describe('AI Pipeline Stage 1: Intent Classification', () => {
  it('should classify Voter Dashboard queries', async () => {
    const result = await processStage1('Check my voter ID status');
    expect(result.ui_module).toBe('Voter_Dashboard');
  });

  it('should classify Candidate Intelligence queries', async () => {
    const result = await processStage1('Show candidate affidavit');
    expect(result.ui_module).toBe('Candidate_Intelligence');
  });

  it('should classify Fake News Verify queries', async () => {
    const result = await processStage1('Is this news about fraud true?');
    expect(result.ui_module).toBe('Fake_News_Verify');
  });

  it('should classify Voting Day Assistant queries', async () => {
    const result = await processStage1('Where is my polling booth?');
    expect(result.ui_module).toBe('Voting_Day_Assistant');
  });

  it('should classify Micro Learning queries', async () => {
    const result = await processStage1('What is NOTA?');
    expect(result.ui_module).toBe('Micro_Learning');
  });

  it('should handle ambiguous queries', async () => {
    const result = await processStage1('Vote');
    expect(result.ui_module).toBe('Ambiguous');
  });

  it('should handle generic Other queries', async () => {
    const result = await processStage1('Help me with general election info');
    expect(result.ui_module).toBe('Other');
  });
});

describe('AI Pipeline Stage 2: Orchestration', () => {
  it('should orchestrate Voter Dashboard action', async () => {
    const s1 = await processStage1('Check my voter ID');
    const result = await processStage2(s1);
    expect(result.action).toBe('OPEN_VOTER_PORTAL');
    expect(result.external_url).toContain('voters.eci.gov.in');
  });

  it('should orchestrate Candidate Intelligence action', async () => {
    const s1 = await processStage1('Candidate details');
    const result = await processStage2(s1);
    expect(result.action).toBe('FETCH_AFFIDAVIT');
    expect(result.external_url).toContain('myneta.info');
  });

  it('should orchestrate Fake News action', async () => {
    const s1 = await processStage1('Fake news check');
    const result = await processStage2(s1);
    expect(result.action).toBe('RUN_FACT_CHECK');
  });

  it('should orchestrate Voting Day Assistant and require location', async () => {
    const s1 = await processStage1('Polling booth');
    const result = await processStage2(s1);
    expect(result.action).toBe('OPEN_MAP');
    expect(result.requires_location).toBe(true);
  });

  it('should orchestrate Micro Learning and use search data', async () => {
    const s1 = await processStage1('How to vote');
    const searchData = "Probable search result content";
    const result = await processStage2(s1, searchData);
    expect(result.response).toBe(searchData);
  });

  it('should orchestrate Micro Learning without search data using fallback', async () => {
    const s1 = await processStage1('How to vote');
    const result = await processStage2(s1);
    expect(result.response).toContain('Great question!');
  });

  it('should handle ambiguous queries with clarification request', async () => {
    const s1 = await processStage1('Short');
    const result = await processStage2(s1);
    expect(result.action).toBe('REQUEST_CLARIFICATION');
  });
});
