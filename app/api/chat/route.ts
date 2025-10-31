import { db } from "@/app/db/db";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const systemprompt = `You are an expert SQL assistant that helps users to query their database using natural language.

    ${new Date().toLocaleString("sv-SE")}
    You have access to following tools:
    1. db tool - call this tool to query the database.
    2. schema tool - call this tool to get the database schema information.

    When the user asks a question about the database, first use the schema tool to get the database schema.
    Then generate a SQL SELECT query to get the required information from the database.
    Finally, call the db tool with the generated SQL query to get the results.
   
Rules:
- Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
- Always use the schema tool to get the database schema before generating SQL queries.
- Pass in valid SQL syntax in db tool.
- IMPORTANT: To query database call db tool, Don't return just SQL query.

Always respond in a helpful, conversational tone while being technically accurate.`;
  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
    system: systemprompt,
    stopWhen: stepCountIs(5),
    tools: {
      schema: tool({
        description: "Call this tool to get the database schema information",
        inputSchema: z.object({}),
        execute: async () => {
          return `CREATE TABLE products (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	name text NOT NULL,
	category text NOT NULL,
	price real NOT NULL,
	stock integer DEFAULT 0 NOT NULL,
	created_at text DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	product_id integer NOT NULL,
	quantity integer NOT NULL,
	total_amount real NOT NULL,
	sale_date text DEFAULT CURRENT_TIMESTAMP,
	customer_name text NOT NULL,
	region text NOT NULL,
	FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action
);
`;
        },
      }),
      db: tool({
        description: "Call this tool to query a database",
        inputSchema: z.object({
          query: z.string().describe("The SQL query to execute"),
        }),

        execute: async ({ query }) => {
          console.log("Executing query:", query);
          // Dangerous - Hamla hoskta hai yaha 
           return await db.run(query)
          
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
