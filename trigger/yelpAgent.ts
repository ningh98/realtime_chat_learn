import { task } from "@trigger.dev/sdk/v3";
import { createAdminClient } from "@/services/supabase/server";

// 1. Define the Yelp AI Tool (Manual Definition as discussed)
// async function callYelpAi(query: string) {
//   const url = "https://api.yelp.com/ai/chat/v2";

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: query,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`Yelp API Error: ${await response.text()}`);
//   }

//   const data = await response.json();
//   // Adjust this based on the actual Yelp AI response structure
//   return data.message || data.response || JSON.stringify(data);
// }

async function createSession(
  userId: string,
  sessionId: string
): Promise<string | null> {
  const url = `${process.env.API_BASE_URL}/apps/my_agent/users/${userId}/sessions/${sessionId}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (response.ok) {
      console.log(`Session created successfully: ${sessionId}`);
      return sessionId;
    } else {
      console.error(`Failed to create session: ${await response.text()}`);
      return null;
    }
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
}

async function callAi(
  sessionId: string,
  query: string,
  adkUserId: string
): Promise<string> {
  const url = `${process.env.API_BASE_URL}/run`;

  const contextAwarePrompt = `[System Context: You are assisting in Chat Room ID: ${sessionId}] ${query}`;

  const payload = {
    app_name: "my_agent",
    user_id: adkUserId,
    session_id: sessionId,
    new_message: {
      role: "user",
      parts: [{ text: contextAwarePrompt }],
    },
  };

  // 1. REMOVED the try/catch wrapper here so we don't swallow the specific error code
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 2. CHECK FOR 404 explicitly
  // This is the critical missing piece. If 404, we tell the main loop to create a session.
  if (response.status === 404) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error(`ADK API Error: ${response.statusText}`);
  }

  const events = await response.json();

  let assistantMessage = "";
  for (const event of events) {
    const content = event.content || {};
    if (content.role === "model" && content.parts) {
      for (const part of content.parts) {
        if (part.text) {
          assistantMessage += part.text;
        }
      }
    }
  }

  if (!assistantMessage) {
    return "I'm sorry, I couldn't generate a response.";
  }

  return assistantMessage;
}
// 2. Define the Trigger Task
export const yelpAgentTask = task({
  id: "yelp-agent-response",
  run: async (payload: { roomId: string; userQuery: string }) => {
    // Use the UUID we created in the Prerequisite step
    //A. Create session
    const AI_USER_ID = process.env.AI_USER_ID!;
    const sessionId = payload.roomId;
    let aiResponseText = "";
    try {
      console.log(`Attempting to send message to session: ${sessionId}`);
      aiResponseText = await callAi(sessionId, payload.userQuery, AI_USER_ID);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // If the API tells us the session is missing, we create it and retry.
      if (error.message === "SESSION_NOT_FOUND") {
        console.log(`Session ${sessionId} not found. Creating new session...`);

        const created = await createSession(AI_USER_ID, sessionId);
        if (!created) {
          throw new Error("Failed to initialize new AI session.");
        }

        // Retry the message now that the session exists
        aiResponseText = await callAi(sessionId, payload.userQuery, AI_USER_ID);
      } else {
        // Real error (network, etc.), rethrow it
        throw error;
      }
    }

    // C. Write response to Supabase
    const supabase = createAdminClient();

    const { error } = await supabase.from("message").insert({
      text: aiResponseText,
      chat_room_id: payload.roomId,
      author_id: AI_USER_ID,
    });

    if (error) {
      throw new Error(`Failed to post AI message: ${error.message}`);
    }

    return { success: true, replied: aiResponseText };
  },
});
