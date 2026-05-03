export type UIModule = 
  | "Voter_Dashboard" 
  | "Candidate_Intelligence" 
  | "Fake_News_Verify" 
  | "Voting_Day_Assistant" 
  | "Micro_Learning" 
  | "Other"
  | "Ambiguous";

export interface Stage1Output {
  ui_module: UIModule;
  intent_summary: string;
  sentiment: "Curious" | "Skeptical" | "Anxious" | "Neutral";
  details: {
    trigger_element: string;
    input_type: "Text" | "Link" | "Image Description";
    urgency: "High" | "Medium" | "Low";
  };
}

export interface Stage2Output {
  ui_module: UIModule;
  action: string;
  priority_score: number;
  response: string;
  next_step: string;
  external_url: string;
  requires_location?: boolean; // New flag
}

/**
 * Stage 1: Intent Classification & Metadata Extraction
 * In a real app, this would call Gemini with the specific prompt.
 */
export async function processStage1(query: string): Promise<Stage1Output> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  
  let module: UIModule = "Other";
  let summary = "General inquiry";
  let sentiment: Stage1Output["sentiment"] = "Neutral";
  let trigger = "General Search";
  let urgency: Stage1Output["details"]["urgency"] = "Low";

  if (lowerQuery.includes("register") || lowerQuery.includes("voter id") || lowerQuery.includes("epic") || lowerQuery.includes("constituency")) {
    module = "Voter_Dashboard";
    summary = "Voter registration and status inquiry";
    trigger = "EPIC Scanner";
  } else if (lowerQuery.includes("candidate") || lowerQuery.includes("compare") || lowerQuery.includes("criminal") || lowerQuery.includes("asset")) {
    module = "Candidate_Intelligence";
    summary = "Candidate research and comparison";
    trigger = "Compare Tool";
    urgency = "Medium";
  } else if (lowerQuery.includes("http") || lowerQuery.includes("fake") || lowerQuery.includes("whatsapp") || lowerQuery.includes("fact check")) {
    module = "Fake_News_Verify";
    summary = "Misinformation verification request";
    sentiment = "Skeptical";
    trigger = "Fact Checker";
    urgency = "High";
  } else if (lowerQuery.includes("booth") || lowerQuery.includes("where to vote") || lowerQuery.includes("carry") || lowerQuery.includes("wait time")) {
    module = "Voting_Day_Assistant";
    summary = "Polling station navigation and logistics";
    sentiment = "Anxious";
    trigger = "Map Navigation";
    urgency = "High";
  } else if (lowerQuery.includes("nota") || lowerQuery.includes("evm") || lowerQuery.includes("how to") || lowerQuery.includes("security")) {
    module = "Micro_Learning";
    summary = "Educational query about voting process";
    trigger = "Learning Hub";
  }

  // Ambiguity Check: If query is too short or generic "Other"
  if (module === "Other" && (query.trim().length < 10 || !query.includes(" "))) {
    module = "Ambiguous";
    summary = "Query is too vague or short to process.";
  }

  return {
    ui_module: module,
    intent_summary: summary,
    sentiment: sentiment,
    details: {
      trigger_element: trigger,
      input_type: "Text",
      urgency: urgency
    }
  };
}

/**
 * Stage 2: Action & Response Generation
 * Maps the intent to specific app logic and generates a guided response.
 */
export async function processStage2(s1: Stage1Output, searchData?: string): Promise<Stage2Output> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let action = "OPEN_GENERAL_SEARCH";
  let score = 30;
  let response = searchData || "I can help you with that. What specifically would you like to know?";
  let nextStep = "Ask a more specific question";
  let url = "https://eci.gov.in";

  if (s1.ui_module === "Ambiguous") {
    return {
      ui_module: "Ambiguous",
      action: "REQUEST_CLARIFICATION",
      priority_score: 0,
      response: "I'm sorry, I couldn't quite understand your request. Could you please provide more details or ask a specific question about elections?",
      next_step: "Try rephrasing your question with more context.",
      external_url: "https://eci.gov.in"
    };
  }

  switch (s1.ui_module) {
    case "Voter_Dashboard":
// ... remaining cases ...
      action = "OPEN_VOTER_PORTAL";
      score = 40;
      response = "I'll help you check your registration status. Your EPIC card is your key to participating in democracy.";
      nextStep = "Go to the official ECI Voter Portal to check your status.";
      url = "https://voters.eci.gov.in/";
      break;
    case "Candidate_Intelligence":
      action = "FETCH_AFFIDAVIT";
      score = 60;
      response = "Transparency is vital. You can compare candidates side-by-side to see their educational backgrounds and assets.";
      nextStep = "View detailed candidate affidavits on the ADR MyNeta portal.";
      url = "https://myneta.info/";
      break;
    case "Fake_News_Verify":
      action = "RUN_FACT_CHECK";
      score = 90;
      response = `Our AI detection engine is analyzing this. Based on our trusted sources (ECI/ADR), we've assigned a confidence score to this claim.`;
      nextStep = "Verify this information through the official ECI Fact-Check dashboard.";
      url = "https://elections24.eci.gov.in/";
      break;
    case "Voting_Day_Assistant":
      action = "OPEN_MAP";
      score = 95;
      response = "Don't worry, I'll guide you to your booth. Make sure to carry your Voter ID or one of the 12 approved documents.";
      nextStep = "Use the ECI Booth Locator to find your exact polling station.";
      url = "https://voters.eci.gov.in/";
      return {
        ui_module: s1.ui_module,
        action: action,
        priority_score: score,
        response: response,
        next_step: nextStep,
        external_url: url,
        requires_location: true
      };
    case "Micro_Learning":
      action = "START_MODULE";
      score = 25;
      response = "Great question! Understanding things like NOTA and EVM security helps strengthen our democracy.";
      nextStep = "Explore the ECI SVEEP portal for simplified educational resources.";
      url = "https://ecisveep.nic.in/";
      break;
  }

  return {
    ui_module: s1.ui_module,
    action: action,
    priority_score: score,
    response: response,
    next_step: nextStep,
    external_url: url
  };
}
