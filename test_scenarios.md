# Praja Vidhya: AI Pipeline Test Scenarios

This document outlines the expected behavior of the 2-stage AI pipeline for various citizen queries.

| # | User Query | Expected UI Module (Stage 1) | Expected Action (Stage 2) | Pipeline Logic / Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| 1 | "Show candidate affidavit" | `Candidate_Intelligence` | `FETCH_AFFIDAVIT` | Reroutes to ADR MyNeta portal. |
| 2 | "That MLA guy details" | `Candidate_Intelligence` | `FETCH_AFFIDAVIT` | Handles informal terminology (MLA). |
| 3 | "Yeh candidate ka criminal record kya hai?" | `Candidate_Intelligence` | `FETCH_AFFIDAVIT` | **Multilingual Support**: Correctly routes Hinglish queries. |
| 4 | "Is this news about election fraud true?" | `Fake_News_Verify` | `RUN_FACT_CHECK` | High priority; explains confidence score. |
| 5 | "Where is my polling booth right now?" | `Voting_Day_Assistant` | `OPEN_MAP` | **Location Lock**: Triggers request for user location & calculates distance. |
| 6 | "Check my voter ID status" | `Voter_Dashboard` | `OPEN_VOTER_PORTAL` | Provides direct link to ECI voter portal. |
| 7 | "Explain how voting works for first time voters" | `Micro_Learning` | `START_MODULE` | **Web Search**: Fetches probable answer from Google/ECI SVEEP. |
| 8 | "Show affidavit of candidate XYZ123" | `Candidate_Intelligence` | `FETCH_AFFIDAVIT` | Handles specific candidate mentions. |
| 9 | "Is this candidate corrupt?" | `Ambiguous` / `Candidate_Intelligence` | `REQUEST_CLARIFICATION` | **Neutrality Guard**: Refuses to provide biased labels; provides data only. |
| 10 | "Compare candidates and tell who is better" | `Candidate_Intelligence` | `FETCH_AFFIDAVIT` | **Neutrality Guard**: Offers side-by-side comparison without making a judgment. |

## Specialized Edge Case Tests

### 1. Ambiguity Handling
- **Query**: "Vote"
- **Result**: `Ambiguous` module triggered.
- **Response**: "I'm sorry, I couldn't quite understand your request. Could you please provide more details?"

### 2. Location-Based Rerouting
- **Query**: "Nearest booth"
- **Trigger**: `requires_location: true`
- **Verification**: App shows a card asking for "Nearby Location" and calculates distance before showing the final "Proceed to Official Site" button.

### 3. Google Search Simulation
- **Query**: "What is NOTA?"
- **Logic**: Detected as `Micro_Learning`.
- **Response**: Fetches detailed summary from ECI/ADR datasets and shows "Fetching from Verified Sources" loading state.
