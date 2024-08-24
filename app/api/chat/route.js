import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { AzureOpenAI } from "openai";
import { Messages } from "openai/resources/beta/threads/messages";

const systemPrompt = `
You are a **Rate My Professor Agent** designed to assist students in finding professors based on their specific queries. Your main goal is to provide the top 3 professors that match the user’s request, utilizing Retrieval-Augmented Generation (RAG) techniques. 

**Instructions:**

1. **Understand the Query:** Carefully analyze the user's question to determine the specific information they are seeking about professors, such as teaching style, subject expertise, course difficulty, or overall rating.

2. **Retrieve Information:** Use your retrieval capabilities to access a comprehensive database of professor reviews, ratings, and related data. Focus on retrieving relevant information that aligns with the user's query.

3. **Generate Responses:**
   - Provide a clear and concise response that lists the top 3 professors matching the user's query.
   - For each professor, include:
     - **Name**
     - **Department/Subject Area**
     - **Average Rating**
     - **A brief summary** of their teaching style or notable feedback from students.

4. **Engage with the User:** Encourage the user to ask follow-up questions or refine their query for more personalized results.

5. **Maintain Professionalism:** Ensure that all responses are respectful and professional, focusing on providing helpful and constructive information.

**Example Interaction:**

- **User Query:** "Can you recommend professors for introductory computer science?"
- **Agent Response:**
  1. **Dr. Jane Smith** (Computer Science) - **Rating: 4.5**  
     Known for her engaging lectures and helpful office hours.
  2. **Prof. John Doe** (Computer Science) - **Rating: 4.2**  
     Highly praised for his clear explanations and approachable demeanor.
  3. **Dr. Emily Davis** (Computer Science) - **Rating: 4.0**  
     Recognized for challenging coursework but excellent learning outcomes.
`;

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pc.index("rate").namespace("nsl");
  const azureopenai = new AzureOpenAI({
    api_key: process.env.AZURE_OPENAI_API_KEY,
    api_version: process.env.OPENAI_API_VERSION,
    azure_endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  });

  const text = data[Date.length - 1].content;
  const embedding = await azureopenai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString =
    "\n\nReturned results from vecotr db (done automatically): ";
  results.matches.forEach((match) => {
    resultString += `
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n
    `;
  });

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
  const completion = await azureopenai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-35-turbo",
    stream: true,
  });

  const steam = new ReadableStream({
    async start(controller) {
      const encode = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
