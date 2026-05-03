import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API Key
// In production, this should be handled securely via environment variables
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  // If API Key is provided, use Google's Gemini for real intelligence
  if (API_KEY) {
    try {
      const prompt = `Analyze this Indian citizen's election query: "${query}"
      Classify it into ONE module: Voter_Dashboard, Candidate_Intelligence, Fake_News_Verify, Voting_Day_Assistant, Micro_Learning, Other, or Ambiguous.
      Return ONLY a JSON object: {"module": "string", "summary": "brief summary", "sentiment": "Curious|Skeptical|Anxious|Neutral", "urgency": "Low|Medium|High"}`;
      
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      
      return {
        ui_module: data.module as UIModule,
        intent_summary: data.summary,
        sentiment: data.sentiment as any,
        details: { 
          trigger_element: "Gemini AI Engine", 
          input_type: "Text",
          urgency: data.urgency as any 
        }
      };
    } catch (e) {
      console.error("Gemini Stage 1 error, falling back to rule-based:", e);
    }
  }

  // Fallback to rule-based logic (ensures reliability)
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
  } else if (lowerQuery.includes("http") || lowerQuery.includes("fake") || lowerQuery.includes("whatsapp") || lowerQuery.includes("fact check") || lowerQuery.includes("news") || lowerQuery.includes("true")) {
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
  // If API Key is available, use Gemini for high-quality, neutral orchestration
  if (API_KEY) {
    try {
      const prompt = `Act as Praja Vidhya, a neutral election assistant. 
      Intent: ${s1.intent_summary}
      Search Data: ${searchData || "None"}
      Generate a professional, neutral response for a citizen. 
      Return JSON: {"response": "string", "next_step": "string", "action": "string"}`;
      
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      
      return {
        ui_module: s1.ui_module,
        action: data.action,
        priority_score: 90,
        response: data.response,
        next_step: data.next_step,
        external_url: "https://eci.gov.in",
        requires_location: s1.ui_module === "Voting_Day_Assistant"
      };
    } catch (e) {
      console.error("Gemini Stage 2 error, falling back:", e);
    }
  }

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
      url = "https://www.google.com/maps/search/polling+booth+near+me";
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
      response = searchData || "Great question! Understanding things like NOTA and EVM security helps strengthen our democracy.";
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
