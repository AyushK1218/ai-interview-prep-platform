const {GoogleGenAI, Type} = require("@google/genai");
const {z} = require("zod");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function invokeGeminiAI() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello Gemini! How big is Central Park?",
    });

    console.log(response.text);
}

// Zod schema for backend validation
const interviewReportSchema = z
    .object({
        matchScore: z.number().int().min(0).max(100),

        technicalQuestions: z.array(
            z.object({
                question: z.string().min(1),
                intention: z.string().min(1),
                answer: z.string().min(1),
            })
        ).length(5),

        behavioralQuestions: z.array(
            z.object({
                question: z.string().min(1),
                intention: z.string().min(1),
                answer: z.string().min(1),
            })
        ).length(5),

        skillGaps: z.array(
            z.object({
                skill: z.string().min(1),
                severity: z.enum(["low", "medium", "high"]),
            })
        ).min(3).max(6),

        preparationPlan: z.array(
            z.object({
                day: z.number().int().min(1).max(7),
                focus: z.string().min(1),
                tasks: z.array(z.string().min(1)).min(3).max(5),
            })
        ).length(7),

        title: z.string().min(1),
    })
    .strict();

// Gemini schema for response generation
const geminiInterviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 indicating candidate-job match.",
        },

        technicalQuestions: {
            type: Type.ARRAY,
            minItems: 5,
            maxItems: 5,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                    },
                    intention: {
                        type: Type.STRING,
                    },
                    answer: {
                        type: Type.STRING,
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },

        behavioralQuestions: {
            type: Type.ARRAY,
            minItems: 5,
            maxItems: 5,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                    },
                    intention: {
                        type: Type.STRING,
                    },
                    answer: {
                        type: Type.STRING,
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },

        skillGaps: {
            type: Type.ARRAY,
            minItems: 3,
            maxItems: 6,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: {
                        type: Type.STRING,
                    },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "high"],
                    },
                },
                required: ["skill", "severity"],
            },
        },

        preparationPlan: {
            type: Type.ARRAY,
            minItems: 7,
            maxItems: 7,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: {
                        type: Type.INTEGER,
                    },
                    focus: {
                        type: Type.STRING,
                    },
                    tasks: {
                        type: Type.ARRAY,
                        minItems: 3,
                        maxItems: 5,
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },

        title: {
            type: Type.STRING,
        },
    },
    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title",
    ],
};

async function generateInterviewReport({
                                           resume,
                                           selfDescription,
                                           jobDescription,
                                       }) {
    const prompt = `
You are a strict interview report generator.

Generate an interview report for a candidate using ONLY the information provided below.

Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription || "Not provided"}

STRICT RULES:
- Return only valid JSON.
- Do not return markdown.
- Do not add text before or after the JSON.
- Do not wrap the JSON in code blocks.
- Do not invent unsupported experience, skills, projects, companies, education, certifications, or achievements.
- matchScore must be a whole number between 0 and 100.
- technicalQuestions must contain exactly 5 items.
- behavioralQuestions must contain exactly 5 items.
- skillGaps must contain between 3 and 6 items.
- preparationPlan must contain exactly 7 days.
- Each preparationPlan item must contain 3 to 5 tasks.
- severity must be only "low", "medium", or "high".
- title must be extracted from the job description. If unavailable, use "Not provided".
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiInterviewReportSchema,
            temperature: 0,
        },
    });

    let json;

    try {
        json = JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini returned invalid JSON:");
        console.error(response.text);
        throw new Error("Invalid JSON returned by Gemini.");
    }

    const validated = interviewReportSchema.safeParse(json);

    if (!validated.success) {
        console.error("Schema validation failed:");
        console.error(validated.error.flatten());
        console.error("Raw Gemini output:");
        console.error(json);

        throw new Error("Gemini response did not match the Zod schema.");
    }
    
    return validated.data;
}

module.exports = {
    invokeGeminiAI,
    generateInterviewReport,
};