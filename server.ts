import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initialSchemes, initialComplaints, initialDocumentServices } from "./src/seedData";
import { Complaint, UserProfile } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit for photo uploads
app.use(express.json({ limit: "15mb" }));

// Initialize the in-memory database using the seed data
let dbComplaints: Complaint[] = [...initialComplaints];
const dbSchemes = [...initialSchemes];
const dbDocumentServices = [...initialDocumentServices];

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini SDK initialized successfully on backend.");
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing or placeholder. Running in mock AI mode.");
}

// Utility helper to call Gemini generateContent with JSON response
async function generateJSONResponse(prompt: string, systemInstruction?: string) {
  if (!ai) {
    throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in Secrets.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
    
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// Helper to convert base64 image string to Gemini Part object
function base64ToPart(base64Str: string) {
  // Extract content-type and base64 data if it is a data URI
  let mimeType = "image/jpeg";
  let data = base64Str;
  
  if (base64Str.startsWith("data:")) {
    const matches = base64Str.match(/^data:([^;]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      data = matches[2];
    }
  }
  
  return {
    inlineData: {
      mimeType,
      data
    }
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & Config Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!ai,
    time: new Date().toISOString()
  });
});

// 2. Fetch Schemes
app.get("/api/schemes", (req, res) => {
  res.json(dbSchemes);
});

// 3. Fetch Complaints
app.get("/api/complaints", (req, res) => {
  res.json(dbComplaints);
});

// 4. Fetch Document Services Checklists
app.get("/api/document-services", (req, res) => {
  res.json(dbDocumentServices);
});

// 5. AI Chat Assistant ("Sathi")
app.post("/api/sathi/chat", async (req, res) => {
  const { message, chatHistory = [], readingLevel = "Standard", language = "English", explainJargon = false } = req.body;
  
  if (!ai) {
    // Elegant fallback mock if API key is not set
    return res.json({
      text: `Namaste! I am Sathi, your Bharat Civic Companion. I am currently operating in offline mode because the Gemini API key is not configured. Based on my offline database, you can look into the **${dbSchemes[0].name}** for agricultural support or **${dbSchemes[1].name}** for health benefits! [Confirm details on the official portal before applying]`,
      citations: [dbSchemes[0].id, dbSchemes[1].id],
      jargon: [
        { term: "Offline Mode", explanation: "A state where Sathi is running locally without connection to our central brain." }
      ]
    });
  }
  
  const systemInstruction = `You are "Sathi", an empathetic, extremely knowledgeable, and culturally warm AI civic assistant designed for Indian citizens.
Your job is to answer queries regarding government schemes, civil procedures, and civic complaints.
Follow these rules strictly:
1. Always base your answers on the provided JSON knowledge base of Indian Government Schemes: ${JSON.stringify(dbSchemes)}.
2. If the user asks about a scheme, explain it simply. Cite the exact Scheme Name in your response using bracket tags like [ayushman-bharat] or [pm-kisan] matching their IDs.
3. Language constraint: The user has selected the language: "${language}". You should respond in a natural, friendly manner, honoring code-switching (e.g. Hinglish, Tamil-English) if natural, but primarily in the selected language.
4. Reading Level constraint: Adjust your response style to "${readingLevel}":
   - "Simple": 5th-grade level, highly structured, very easy terminology.
   - "Standard": Standard helpful tone, moderate detail.
   - "Detailed": In-depth explanation of clauses, procedures, and links.
5. Identify any complex administrative or legal terms (jargon) you use (e.g. patta chitta, DBT, SECC, collateral-free, compound interest, PATTA, domicile) and compile a list of explanations.
6. Return your output strictly in JSON format matching this schema:
{
  "text": "The complete structured response text including inline citation tags like [ayushman-bharat] where applicable.",
  "citations": ["list of matching scheme IDs cited"],
  "jargon": [
    { "term": "term name used in response", "explanation": "simple plain-language explanation of this term" }
  ]
}`;

  const prompt = `User Message: "${message}"\nChat History so far: ${JSON.stringify(chatHistory.slice(-8))}`;

  try {
    const jsonOutput = await generateJSONResponse(prompt, systemInstruction);
    res.json(jsonOutput);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to query Gemini API", details: error.message });
  }
});

// 6. Conversational Onboarding / Scheme Eligibility Matcher
app.post("/api/schemes/onboard", async (req, res) => {
  const { chatHistory = [], currentProfile = {} } = req.body;
  
  if (!ai) {
    // Fallback Mock
    return res.json({
      capturedProfile: {
        fullName: currentProfile.fullName || "Nagrik",
        age: currentProfile.age || 35,
        state: currentProfile.state || "Tamil Nadu",
        income: currentProfile.income || 150000,
        occupation: currentProfile.occupation || "Agriculture",
        category: currentProfile.category || "General",
        gender: currentProfile.gender || "Female",
        isFarmer: currentProfile.isFarmer !== undefined ? currentProfile.isFarmer : true,
        isStudent: currentProfile.isStudent !== undefined ? currentProfile.isStudent : false,
        nagrikId: currentProfile.nagrikId || "NAG-654129"
      },
      type: "results",
      text: "Based on our offline analysis, you qualify for **PM-KISAN** and the **Ayushman Bharat** schemes! Please enter your Gemini API Key in Settings to get real-time dynamic AI eligibility reasoning.",
      matches: [
        { schemeId: "pm-kisan", reason: "As an agricultural worker with land holding, you are eligible for ₹6,000 annual income support.", confidence: 95 },
        { schemeId: "ayushman-bharat", reason: "Your annual household income is below the threshold, enabling access to cashless healthcare up to ₹5 Lakhs.", confidence: 90 }
      ]
    });
  }
  
  const systemInstruction = `You are the core intelligence of "Nagrik AI Eligibility Matcher" — a highly interactive onboarding assistant that determines which Indian government schemes a citizen qualifies for.
We need to capture the following fields of the citizen's profile:
1. fullName (string)
2. age (integer)
3. state (string)
4. income (integer, annual in INR)
5. occupation (string, e.g. Agriculture, Business, Homemaker, Unemployed)
6. category (string, e.g. General, OBC, SC, ST)
7. gender (string, e.g. Male, Female, Other)
8. isFarmer (boolean)
9. isStudent (boolean)

Your goal is to inspect the prior conversations and current profile fields.
- If some crucial information is missing to make a match, set "type" to "question" and ask a warm, welcoming conversational question asking for ONE or TWO missing pieces (e.g. "What state are you from?", "Could you share your approximate annual household income?").
- Do NOT ask for everything at once. Keep the interaction like a friendly WhatsApp chat.
- If you have enough info to determine scheme eligibility (or if the user has completed at least 4-5 turns), set "type" to "results". Evaluate their eligibility against the registered schemes database: ${JSON.stringify(dbSchemes)}.
- Return the updated "capturedProfile" based on prior conversation and the new message. Ensure you assign a fictional Nagrik ID like "NAG-XXXXXX" (6 random digits) if not already present.
- When generating "results", rank the matching schemes in the "matches" array. For each match, provide a highly personalized, warm explanation ("reason") of exactly "why they qualify" based on their inputs, along with a "confidence" score (percentage 0-100).
- Every "results" response MUST include the disclaimer text: "Confirm details on the official portal before applying" in the text field or reasons.

Return strictly in JSON format matching this schema:
{
  "capturedProfile": {
    "nagrikId": "NAG-XXXXXX",
    "fullName": "Name if known",
    "age": number_or_null,
    "state": "State name if known",
    "income": annual_income_or_null,
    "occupation": "Occupation if known",
    "category": "Category if known",
    "gender": "Gender if known",
    "isFarmer": boolean_or_null,
    "isStudent": boolean_or_null
  },
  "type": "question" | "results",
  "text": "The conversational question to ask next, or the summary text introducing the eligible schemes.",
  "matches": [
    {
      "schemeId": "ID of matching scheme matching dbSchemes (e.g. pm-kisan)",
      "reason": "Personalized description explaining why their profile qualifies",
      "confidence": number_between_0_and_100
    }
  ]
}`;

  const prompt = `Current Profile State: ${JSON.stringify(currentProfile)}\nConversation History: ${JSON.stringify(chatHistory.slice(-10))}`;

  try {
    const jsonOutput = await generateJSONResponse(prompt, systemInstruction);
    res.json(jsonOutput);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to evaluate scheme eligibility", details: error.message });
  }
});

// 7. Auto-classify Complaint Photo (Gemini Vision)
app.post("/api/complaints/classify", async (req, res) => {
  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ error: "No image content provided." });
  }
  
  if (!ai) {
    // Mock classification if key is missing
    return res.json({
      title: "Pothole Hazard Identified",
      category: "Roads & Footpaths",
      urgency: "high",
      description: "Severe road deterioration and large waterlogged potholes observed, obstructing vehicular traffic and endangering two-wheelers."
    });
  }
  
  try {
    const imagePart = base64ToPart(imageBase64);
    const textPart = {
      text: `Analyze this image of a civic issue in India (e.g. pothole, garbage pile, street light, leak, public hazard) and provide a structured JSON classification:
{
  "title": "A short, engaging title describing the issue (max 6 words)",
  "category": "Roads & Footpaths" or "Sanitation & Garbage" or "Electricity & Lighting" or "Water & Sewage" or "Public Safety",
  "urgency": "low" or "medium" or "high" or "critical",
  "description": "A draft of a detailed description explaining what is seen and why it needs immediate attention from local authorities."
}`
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });
    
    const jsonOutput = JSON.parse((response.text || "{}").trim());
    res.json(jsonOutput);
  } catch (error: any) {
    res.status(500).json({ error: "Vision classification failed", details: error.message });
  }
});

// 8. Submit Complaint with Proactive Duplicate Detection
app.post("/api/complaints/report", async (req, res) => {
  const { title, description, category, latitude, longitude, imageBase64, urgency = "medium" } = req.body;
  
  if (!title || !description || !latitude || !longitude) {
    return res.status(400).json({ error: "Title, description, latitude, and longitude are required." });
  }
  
  const newLat = parseFloat(latitude);
  const newLng = parseFloat(longitude);
  
  if (!ai) {
    // Simple mock duplicate check: if within 0.005 lat/lng distance of an existing complaint, merge it!
    const duplicate = dbComplaints.find(c => {
      const latDiff = Math.abs(c.latitude - newLat);
      const lngDiff = Math.abs(c.longitude - newLng);
      return latDiff < 0.008 && lngDiff < 0.008 && c.category === category;
    });
    
    if (duplicate) {
      duplicate.affectedCount += 1;
      duplicate.updates.push({
        date: new Date().toISOString(),
        text: `Another citizen reported this issue. Affected count boosted. Total citizens supported: ${duplicate.affectedCount}.`,
        status: duplicate.status
      });
      return res.json({
        merged: true,
        originalComplaintId: duplicate.id,
        originalComplaint: duplicate,
        message: `🔥 Duplicate Alert! A similar issue is already logged at this spot. We have merged your report into the existing thread. ${duplicate.affectedCount} citizens have now co-signed this issue!`
      });
    }
    
    // Create new complaint
    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      title,
      description,
      category,
      latitude: newLat,
      longitude: newLng,
      imageUrl: imageBase64 || "https://images.unsplash.com/photo-1599740831144-5368652bd084?auto=format&fit=crop&w=600&q=80",
      status: "Reported",
      statusText: "Successfully filed in the ward database. Awaiting engineer assignment.",
      urgency: urgency,
      createdAt: new Date().toISOString(),
      affectedCount: 1,
      updates: [
        { date: new Date().toISOString(), text: "Complaint successfully registered by Nagrik AI Sathi.", status: "Reported" }
      ]
    };
    
    dbComplaints.unshift(newComplaint);
    return res.json({
      merged: false,
      complaint: newComplaint
    });
  }
  
  try {
    // Leverage Gemini for smart semantic and location duplicate analysis
    // Format existing complaints coordinates and titles
    const formattedExisting = dbComplaints.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      lat: c.latitude,
      lng: c.longitude,
      description: c.description
    }));
    
    const systemInstruction = `You are an elite municipal coordinator database agent.
You are given a newly reported complaint with location (lat/lng) and description, and a list of existing active complaints in the database.
Determine if the newly reported complaint is a DUPLICATE of an existing one.
A complaint is a duplicate if:
1. It is of the same category.
2. The distance between them is physically close (approx same coordinates or lat/lng difference within 0.01 degrees, which is ~1 km).
3. The descriptions are semantically describing the exact same underlying issue (e.g. "Water leak on Gandhipuram 4th lane" and "Pipe broken in Gandhipuram near school corner").

If it is a duplicate, set "isDuplicate" to true and "duplicateOfId" to the ID of the matched complaint. Also draft a friendly "mergeMessage" in natural, reassuring language starting with an emoji (e.g., "🔥 Duplicate Alert!...").
If it is not a duplicate, set "isDuplicate" to false and "duplicateOfId" to null.

Return strictly in JSON format matching this schema:
{
  "isDuplicate": boolean,
  "duplicateOfId": "ID of original complaint, or null",
  "mergeMessage": "Personalized friendly message highlighting that other citizens are affected and we are grouping them together."
}`;

    const prompt = `New Complaint:
Title: "${title}"
Category: "${category}"
Location: Lat ${newLat}, Lng ${newLng}
Description: "${description}"

Existing Complaints Database:
${JSON.stringify(formattedExisting)}`;

    const response = await generateJSONResponse(prompt, systemInstruction);
    
    if (response.isDuplicate && response.duplicateOfId) {
      const original = dbComplaints.find(c => c.id === response.duplicateOfId);
      if (original) {
        original.affectedCount += 1;
        
        // Boost urgency if duplicates keep getting filed
        if (original.affectedCount >= 10 && original.urgency !== "critical") {
          original.urgency = "high";
        }
        
        original.updates.push({
          date: new Date().toISOString(),
          text: `Another citizen reported this issue. Verification count increased to ${original.affectedCount} co-signers.`,
          status: original.status
        });
        
        return res.json({
          merged: true,
          originalComplaintId: original.id,
          originalComplaint: original,
          message: response.mergeMessage || `🔥 Multi-citizen Impact! We found a similar issue already reported nearby. Your request has been merged to amplify attention! Total affected: ${original.affectedCount} citizens.`
        });
      }
    }
    
    // Not a duplicate: Create new complaint
    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      title,
      description,
      category,
      latitude: newLat,
      longitude: newLng,
      imageUrl: imageBase64 || "https://images.unsplash.com/photo-1599740831144-5368652bd084?auto=format&fit=crop&w=600&q=80",
      status: "Reported",
      statusText: "Awaiting engineering review and ward inspector assignment.",
      urgency: urgency,
      createdAt: new Date().toISOString(),
      affectedCount: 1,
      updates: [
        { date: new Date().toISOString(), text: "Complaint successfully registered by Nagrik AI Sathi.", status: "Reported" }
      ]
    };
    
    dbComplaints.unshift(newComplaint);
    res.json({
      merged: false,
      complaint: newComplaint
    });
  } catch (error: any) {
    console.error("Duplicate checking error:", error);
    // Safe fallback to save
    const fallbackComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      title,
      description,
      category,
      latitude: newLat,
      longitude: newLng,
      imageUrl: imageBase64 || "https://images.unsplash.com/photo-1599740831144-5368652bd084?auto=format&fit=crop&w=600&q=80",
      status: "Reported",
      statusText: "Saved to ward database.",
      urgency: urgency,
      createdAt: new Date().toISOString(),
      affectedCount: 1,
      updates: [
        { date: new Date().toISOString(), text: "Complaint logged under fallback route.", status: "Reported" }
      ]
    };
    dbComplaints.unshift(fallbackComplaint);
    res.json({
      merged: false,
      complaint: fallbackComplaint
    });
  }
});

// 9. Document Completeness & Legibility Assistant (Vision check)
app.post("/api/documents/check-readiness", async (req, res) => {
  const { imageBase64, documentName } = req.body;
  
  if (!imageBase64 || !documentName) {
    return res.status(400).json({ error: "Missing document image or document details." });
  }
  
  if (!ai) {
    // Offline/no key mock
    return res.json({
      ready: true,
      feedback: `👍 Offline check: Uploaded image for **${documentName}** appears readable and complete. Safe to proceed! Add your Gemini API key in settings for deep visual text validation.`,
      confidence: 85
    });
  }
  
  try {
    const imagePart = base64ToPart(imageBase64);
    const textPart = {
      text: `Analyze this image which is uploaded as an Indian citizen's "${documentName}" (such as Aadhaar card, Ration Card, Driver's License, Age Proof, Hospital Letter, etc.) for a government service readiness assistant.
Check:
1. Is it readable? Is it blurred or dark?
2. Does it look like a valid document of this category?
3. Provide helpful, culturally polite feedback in English (or Hinglish) advising if anything is missing, or if it looks completely ready.
State clearly: This is explicitly NOT a legal verification, only a readiness helper.

Return strictly in JSON format matching this schema:
{
  "ready": boolean,
  "feedback": "Warm and constructive feedback. Offer tips like turning on flash, capturing clear corners.",
  "confidence": number_between_0_and_100
}`
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });
    
    const jsonOutput = JSON.parse((response.text || "{}").trim());
    res.json(jsonOutput);
  } catch (error: any) {
    res.status(500).json({ error: "Document verification vision check failed", details: error.message });
  }
});

// ==========================================
// VITE AND STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
