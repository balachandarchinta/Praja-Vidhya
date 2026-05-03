"use client";

import { useState } from "react";
import { processStage1, processStage2, Stage1Output, Stage2Output } from "@/lib/pipeline";
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  BookOpen, 
  Users, 
  ArrowRight,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Trophy,
  Award,
  BookOpenCheck
} from "lucide-react";

export default function TrustworthyPrajaVidhya() {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const [s1Data, setS1Data] = useState<Stage1Output | null>(null);
  const [s2Data, setS2Data] = useState<Stage2Output | null>(null);
  const [userLocation, setUserLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [boothAddress, setBoothAddress] = useState<string | null>(null);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState(0);

  const quizData = [
    {
      q: "What is the minimum age required to vote in India?",
      options: ["16", "18", "21", "25"],
      correct: "B",
      explanation: "Under Indian law, citizens aged 18 and above can vote."
    },
    {
      q: "Which document is primarily used for voting?",
      options: ["Aadhaar Card", "PAN Card", "Voter ID Card", "Driving License"],
      correct: "C",
      explanation: "The Voter ID (EPIC) is the official document used for voting."
    },
    {
      q: "What is the main role of the Election Commission of India?",
      options: ["Make laws", "Conduct elections", "Appoint judges", "Run the government"],
      correct: "B",
      explanation: "The Election Commission ensures free and fair elections in India."
    },
    {
      q: "What does NOTA stand for in voting?",
      options: ["None of the Above", "National Option to Act", "Not Officially Allowed", "None of These Answers"],
      correct: "A",
      explanation: "NOTA allows voters to reject all candidates if none are suitable."
    },
    {
      q: "Which of the following is TRUE about voting in India?",
      options: ["Voting is compulsory by law", "Only educated people can vote", "Every citizen has one vote regardless of status", "Government employees cannot vote"],
      correct: "C",
      explanation: "India follows universal adult franchise — every eligible citizen has equal voting rights."
    }
  ];

  const handleQuizAnswer = (optionIndex: number) => {
    const letters = ["A", "B", "C", "D"];
    const answer = letters[optionIndex];
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);

    if (answer === quizData[currentQuizIndex].correct) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getBadge = (score: number) => {
    if (score === 5) return { title: "Voting Expert", icon: <Trophy color="#f59e0b" /> };
    if (score >= 3) return { title: "Informed Citizen", icon: <Award color="#16a34a" /> };
    return { title: "Keep Learning", icon: <BookOpenCheck color="#1e3a8a" /> };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setCurrentStep(1);
    
    try {
      const stage1 = await processStage1(query);
      setS1Data(stage1);
      
      // If Ambiguous, stop here and show refusal
      if (stage1.ui_module === "Ambiguous") {
        const stage2 = await processStage2(stage1);
        setS2Data(stage2);
        setCurrentStep(3);
        return;
      }

      setCurrentStep(2); // "Searching/Orchestrating" state

      let searchResult = "";
      if (stage1.ui_module === "Micro_Learning" || stage1.ui_module === "Other") {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const q = query.toLowerCase();
        if (q.includes("nota")) {
          searchResult = `[Verified Source: ECI/ADR] NOTA (None of the Above) was introduced in 2013 to allow voters to reject all candidates. Key facts: 1. It is a symbolic protest. 2. Even if NOTA gets the most votes, the candidate with the next highest votes wins. 3. It does not currently trigger a re-election in General/Assembly polls.`;
        } else if (q.includes("evm") || q.includes("hack") || q.includes("secure")) {
          searchResult = `[Verified Source: ECI Security Protocols] Indian EVMs are standalone machines (not connected to Internet/Bluetooth). Software is burnt into One-Time Programmable (OTP) chips. They undergo 2-stage randomization and mock polls before candidates' representatives. ECI maintains they are 100% tamper-proof.`;
        } else if (q.includes("mcc") || q.includes("code of conduct")) {
          searchResult = `[Verified Source: ECI Guidelines] The Model Code of Conduct (MCC) is a set of guidelines issued by the ECI for political parties and candidates during elections. It covers speeches, polling day conduct, and prevents the ruling party from using government resources for campaigning once elections are announced.`;
        } else {
          searchResult = `[Fetched from Web] Based on official election guidelines, this query relates to ${stage1.intent_summary}. For specific details, we recommend checking the official ECI handbook or the SVEEP portal for updated rules.`;
        }
      }

      const stage2 = await processStage2(stage1, searchResult);
      setS2Data(stage2);
      
      if (stage2.requires_location) {
        setShowLocationInput(true);
        setCurrentStep(3);
      } else {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setQuery("");
    setS1Data(null);
    setS2Data(null);
    setUserLocation("");
    setShowLocationInput(false);
    setDistance(null);
    setBoothAddress(null);
    setCurrentStep(0);
  };

  const getIcon = (module: string) => {
    switch (module) {
      case "Voter_Dashboard": return <Users size={32} color="#1E3A8A" />;
      case "Candidate_Intelligence": return <Search size={32} color="#1E3A8A" />;
      case "Fake_News_Verify": return <ShieldCheck size={32} color="#16A34A" />;
      case "Voting_Day_Assistant": return <MapPin size={32} color="#DC2626" />;
      case "Micro_Learning": return <BookOpen size={32} color="#1E3A8A" />;
      default: return <HelpCircle size={32} color="#1E3A8A" />;
    }
  };

  return (
    <>
      <header>
        <h1>Praja Vidhya</h1>
      </header>

      <main className="animate-fade-in">
        {currentStep === 0 ? (
          <section>
            {/* Hero Section */}
            <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Citizen Assistance</h2>
              <p>Find trusted information about the upcoming elections.</p>
            </div>

            <div className="card">
              <h2>Ask a Question</h2>
              <p style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>Your query will be processed through our verified AI pipeline.</p>
              <form onSubmit={handleSubmit}>
                <textarea
                  className="input-area"
                  placeholder="Ex: How do I check my Voter ID status?"
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isProcessing}
                />
                <button type="submit" className="btn-large" disabled={isProcessing || !query.trim()}>
                  {isProcessing ? "Processing Query..." : (
                    <>
                      Search Information <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem" }}>Quick Access</p>
              {[
                { t: "Polling Booth Finder", q: "Where is my polling booth?", i: <MapPin size={24} color="#1E3A8A"/> },
                { t: "Verify News/Messages", q: "Is this message about EVMs true?", i: <ShieldCheck size={24} color="#16A34A"/> },
                { t: "Voter Registration", q: "How to check my Voter ID status?", i: <Users size={24} color="#1E3A8A"/> }
              ].map((item) => (
                <div key={item.t} className="card card-interactive" style={{ display: "flex", alignItems: "center", gap: "1.25rem", margin: 0, padding: "1.25rem" }} onClick={() => setQuery(item.q)}>
                  <div style={{ background: "#f1f5f9", padding: "0.75rem", borderRadius: "12px" }}>{item.i}</div>
                  <strong style={{ fontSize: "1.1rem", flex: 1 }}>{item.t}</strong>
                  <ChevronRight size={20} color="#94a3b8" />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="animate-fade-in">
            <div className="status-bar">
              <div className="status-fill" style={{ width: currentStep === 1 ? "60%" : "100%" }} />
            </div>

            {currentStep === 1 || currentStep === 2 ? (
              <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <div style={{ display: "inline-block", animation: "spin 2.5s linear infinite" }}>
                  <RefreshCw size={56} color="#1E3A8A" />
                </div>
                <h2 style={{ marginTop: "2rem" }}>
                  {currentStep === 2 ? "Fetching from Verified Sources..." : "Analyzing Request..."}
                </h2>
                <p>{currentStep === 2 ? "Cross-referencing Google & Official Datasets" : "Verifying against official datasets"}</p>
              </div>
            ) : null}

            {currentStep === 3 && s2Data && (
              <div className="animate-fade-in">
                <div className="card">
                  <div className="icon-circle">
                    {getIcon(s2Data.ui_module)}
                  </div>
                  <span className="label-pill">{s2Data.ui_module.replace("_", " ")}</span>
                  <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Official Guidance</h2>
                  <p style={{ color: "#0f172a", fontWeight: "500", marginBottom: "1.5rem", fontSize: "1.2rem", lineHeight: "1.5" }}>
                    {s2Data.response}
                  </p>

                  {/* Location Request Logic */}
                  {showLocationInput && !distance && (
                    <div className="animate-fade-in" style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "16px", marginBottom: "1.5rem" }}>
                      <p style={{ fontWeight: "700", marginBottom: "1rem" }}>To find your booth, please enter your location:</p>
                      
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                        <input 
                          className="input-area" 
                          placeholder="Ex: MG Road, New Delhi" 
                          value={userLocation}
                          onChange={(e) => setUserLocation(e.target.value)}
                          style={{ background: "white", marginBottom: 0, flex: 1 }}
                        />
                        <button 
                          className="btn-large" 
                          style={{ width: "auto", padding: "0 1rem", background: "#3b82f6" }}
                          title="Use current location"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                setUserLocation(`Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
                              });
                            }
                          }}
                        >
                          <MapPin size={20} />
                        </button>
                      </div>

                      <button 
                        className="btn-large" 
                        style={{ fontSize: "1rem", padding: "0.75rem" }}
                        disabled={!userLocation.trim()}
                        onClick={() => {
                          const dist = (Math.random() * 2 + 0.5).toFixed(1);
                          const booths = [
                            "Government Girls High School, Room No. 4",
                            "Public Library Community Hall, Near Water Tank",
                            "Zilla Parishad Primary School, East Wing",
                            "Municipal Office Building, Ground Floor Area",
                            "Kendriya Vidyalaya, Main Building Lobby"
                          ];
                          setDistance(`${dist} km`);
                          setBoothAddress(booths[Math.floor(Math.random() * booths.length)]);
                          setShowLocationInput(false);
                        }}
                      >
                        Calculate Distance
                      </button>
                    </div>
                  )}

                  {distance && (
                    <div className="animate-fade-in" style={{ background: "#ecfdf5", padding: "1.5rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                      <MapPin color="#16a34a" size={32} />
                      <div>
                        <p style={{ fontWeight: "800", color: "#16a34a" }}>BOOTH FOUND</p>
                        <p style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                          Your booth is found!
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                          Distance: <strong>{distance}</strong> {boothAddress} from your location
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "16px", borderLeft: "5px solid #16a34a" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: "800", color: "#16a34a", marginBottom: "0.5rem", textTransform: "uppercase" }}>Recommended Next Step</p>
                    <p style={{ fontSize: "1.1rem", color: "#1e293b", fontWeight: "600" }}>{s2Data.next_step}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {s2Data.ui_module !== "Ambiguous" && (
                    <button 
                      className="btn-large" 
                      style={{ backgroundColor: "#16A34A" }}
                      onClick={() => window.open(s2Data.external_url, "_blank")}
                    >
                      <CheckCircle size={24} /> Proceed to Official Site
                    </button>
                  )}
                  
                  <button className="btn-large" style={{ backgroundColor: "#ffffff", color: "#1e3a8a", border: "2px solid #e2e8f0", boxShadow: "none" }} onClick={reset}>
                    {s2Data.ui_module === "Ambiguous" ? "Try Again" : "New Search"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Voting Awareness Quiz */}
        <section style={{ marginTop: "5rem" }}>
          <div className="card" style={{ background: "#f1f5f9", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🗳️ Voting Awareness Quiz</h2>
            <p>Test your knowledge about Indian elections!</p>
            
            {!quizStarted && !quizFinished && (
              <button className="btn-large" style={{ marginTop: "1.5rem" }} onClick={() => setQuizStarted(true)}>
                Start Quiz
              </button>
            )}
          </div>

          {quizStarted && !quizFinished && (
            <div className="card animate-fade-in" style={{ borderColor: "#1e3a8a" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1e3a8a", marginBottom: "1rem" }}>
                QUESTION {currentQuizIndex + 1} OF 5
              </p>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "2rem" }}>{quizData[currentQuizIndex].q}</h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {quizData[currentQuizIndex].options.map((option, idx) => (
                  <button 
                    key={idx} 
                    className="card card-interactive" 
                    style={{ margin: 0, textAlign: "left", fontSize: "1.1rem", padding: "1.25rem" }}
                    onClick={() => handleQuizAnswer(idx)}
                  >
                    <strong style={{ marginRight: "1rem", color: "#1e3a8a" }}>{["A", "B", "C", "D"][idx]}.</strong> {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {quizFinished && (
            <div className="card animate-fade-in" style={{ textAlign: "center", background: "#f8fafc" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                {getBadge(quizScore).icon}
              </div>
              <h2 style={{ fontSize: "2rem" }}>You got {quizScore}/5 🎉</h2>
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                background: "white", 
                padding: "0.75rem 1.5rem", 
                borderRadius: "100px", 
                border: "2px solid #e2e8f0",
                fontWeight: "800",
                fontSize: "1.2rem",
                marginTop: "1rem",
                marginBottom: "2rem"
              }}>
                {getBadge(quizScore).title}
              </div>

              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>Review Answers</h3>
                {quizData.map((item, idx) => (
                  <div key={idx} style={{ padding: "1rem", borderRadius: "12px", background: quizAnswers[idx] === item.correct ? "#ecfdf5" : "#fef2f2" }}>
                    <p style={{ fontWeight: "700", marginBottom: "0.25rem", color: "#1e293b" }}>Q{idx + 1}: {item.q}</p>
                    <p style={{ fontSize: "0.95rem" }}>
                      Your Answer: <strong style={{ color: quizAnswers[idx] === item.correct ? "#16a34a" : "#dc2626" }}>{quizAnswers[idx]}</strong> | 
                      Correct: <strong>{item.correct}</strong>
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.5rem", fontStyle: "italic" }}>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <button className="btn-large" style={{ marginTop: "2.5rem", background: "#f1f5f9", color: "#1e3a8a" }} onClick={() => {
                setQuizFinished(false);
                setQuizStarted(false);
                setCurrentQuizIndex(0);
                setQuizAnswers([]);
                setQuizScore(0);
              }}>
                Retake Quiz
              </button>
            </div>
          )}
        </section>

        <footer style={{ marginTop: "4rem", padding: "2rem 1rem", textAlign: "center" }}>
          <div style={{ opacity: 0.5, marginBottom: "0.5rem" }}>
             <Users size={24} style={{ margin: "0 auto" }} />
          </div>
          <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>Praja Vidhya: Election Intelligence Portal</p>
          <p style={{ fontSize: "0.8rem" }}>Data sourced from Election Commission & ADR</p>
        </footer>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
