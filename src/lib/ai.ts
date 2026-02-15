import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Analyze child development data and detect delays
 */
export async function analyzeDevelopmentData(
  studentData: any,
  assessments: any[]
): Promise<{ insights: string[]; delays: string[]; strengths: string[] }> {
  try {
    const prompt = `Analyze this child's development data and provide insights:
    
Age: ${studentData.age} months
ISCED Level: ${studentData.iscedLevel}
Recent Assessments: ${JSON.stringify(assessments, null, 2)}

Provide:
1. Key developmental insights
2. Areas of potential delay or concern
3. Areas of strength

Format as JSON: { "insights": ["..."], "delays": ["..."], "strengths": ["..."] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an early childhood development expert. Analyze child development data and provide professional insights.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("AI analysis error:", error);
    return { insights: [], delays: [], strengths: [] };
  }
}

/**
 * Generate personalized activity recommendations
 */
export async function generateActivityRecommendations(
  studentData: any,
  developmentArea: string
): Promise<string[]> {
  try {
    const prompt = `Generate 5 age-appropriate educational activities for:
    
Age: ${studentData.age} months
ISCED Level: ${studentData.iscedLevel}
Development Area: ${developmentArea}
Special Needs: ${studentData.specialNeeds || "None"}

Provide specific, practical activities that parents and teachers can implement.
Format as JSON array: ["activity 1", "activity 2", ...]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an early childhood education specialist. Create engaging, age-appropriate activities.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const activities = JSON.parse(
      completion.choices[0].message.content || "[]"
    );
    return activities;
  } catch (error) {
    console.error("AI activity generation error:", error);
    return [];
  }
}

/**
 * Generate a development progress report
 */
export async function generateProgressReport(
  studentData: any,
  assessments: any[],
  period: string
): Promise<string> {
  try {
    const prompt = `Generate a comprehensive development progress report:
    
Student: ${studentData.name}
Age: ${studentData.age} months
Period: ${period}
Assessments: ${JSON.stringify(assessments, null, 2)}

Create a professional, parent-friendly report covering:
1. Overview of progress
2. Achievements and milestones reached
3. Areas for continued growth
4. Recommendations for home activities

Keep it warm, encouraging, and educational.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced early childhood educator writing progress reports. Be professional yet warm and encouraging.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("AI report generation error:", error);
    return "Error generating report. Please try again.";
  }
}

/**
 * Generate smart parent communication message
 */
export async function generateParentMessage(
  context: string,
  tone: "formal" | "friendly" | "urgent"
): Promise<string> {
  try {
    const toneDescriptions = {
      formal: "professional and formal",
      friendly: "warm and friendly",
      urgent: "urgent but caring",
    };

    const prompt = `Write a ${toneDescriptions[tone]} message to a parent about:
    
${context}

Keep it clear, concise, and appropriate for parent communication.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced teacher communicating with parents. Write clear, professional messages.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("AI message generation error:", error);
    return "";
  }
}

/**
 * Suggest next milestones based on current progress
 */
export async function suggestNextMilestones(
  currentMilestones: any[],
  age: number,
  domain: string
): Promise<string[]> {
  try {
    const prompt = `Based on these achieved milestones:
${JSON.stringify(currentMilestones, null, 2)}

Age: ${age} months
Development Domain: ${domain}

Suggest 3-5 appropriate next milestones to work on.
Format as JSON array: ["milestone 1", "milestone 2", ...]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a child development specialist. Suggest appropriate developmental milestones.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return result.milestones || [];
  } catch (error) {
    console.error("AI milestone suggestion error:", error);
    return [];
  }
}
