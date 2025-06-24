import { GoogleGenerativeAI } from "@google/generative-ai";

const analyzeTicket = async (ticket) => {
  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a ticket triage agent. Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in valid JSON format with no extra text or markdown:

{
  "summary": "Short summary of the ticket",
  "priority": "medium",
  "helpfulNotes": "Here are useful tips...",
  "relatedSkills": ["React", "Node.js"]
}

---

Ticket information:
- Title: ${ticket.title}
- Description: ${ticket.description}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.log("Failed to parse AI response as JSON:", parseError.message);
      console.log("Raw AI response:", text);
      
      // Return a fallback response
      return {
        summary: `Issue: ${ticket.title}`,
        priority: "medium",
        helpfulNotes: `Please review this ticket: ${ticket.description}`,
        relatedSkills: ["General Support"]
      };
    }
  } catch (error) {
    console.error("Error calling Gemini AI:", error.message);
    
    // Return a fallback response when AI fails
    return {
      summary: `Issue: ${ticket.title}`,
      priority: "medium", 
      helpfulNotes: `AI analysis unavailable. Manual review needed: ${ticket.description}`,
      relatedSkills: ["General Support"]
    };
  }
};

export default analyzeTicket;