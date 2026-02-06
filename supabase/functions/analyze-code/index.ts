import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Code and language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert code reviewer and optimizer. Analyze the provided ${language} code and return a JSON response with the following structure:
{
  "score": <number 0-100>,
  "scores": {
    "quality": <number 0-100>,
    "efficiency": <number 0-100>,
    "security": <number 0-100>,
    "readability": <number 0-100>,
    "bestPractices": <number 0-100>
  },
  "issues": [
    {
      "type": "bug" | "security" | "performance" | "style" | "logic",
      "severity": "critical" | "high" | "medium" | "low",
      "line": <number or null>,
      "message": "<description of the issue>",
      "suggestion": "<how to fix it>"
    }
  ],
  "review": {
    "summary": "<brief summary of the code quality>",
    "improvements": ["<list of improvements made>"],
    "securityIssues": ["<list of security concerns>"],
    "performanceIssues": ["<list of performance concerns>"],
    "bestPractices": ["<list of best practice violations>"]
  },
  "optimizedCode": "<the code optimized for performance and efficiency>",
  "rewrittenCode": "<the code rewritten with clean structure, better naming, modular design, and inline comments>"
}

Be thorough in your analysis. Detect bugs, logical errors, performance issues, security vulnerabilities, and best-practice violations. Categorize issues by severity. For optimizedCode, improve time complexity and reduce memory usage. For rewrittenCode, refactor into clean, modular, production-ready code with comments.

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this ${language} code:\n\n${code}` },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Clean up any markdown formatting if present
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default structure if parsing fails
      analysisResult = {
        score: 70,
        scores: {
          quality: 70,
          efficiency: 70,
          security: 70,
          readability: 70,
          bestPractices: 70,
        },
        issues: [],
        review: {
          summary: "Analysis completed with limited results.",
          improvements: [],
          securityIssues: [],
          performanceIssues: [],
          bestPractices: [],
        },
        optimizedCode: code,
        rewrittenCode: code,
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
