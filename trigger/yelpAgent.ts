import { task } from "@trigger.dev/sdk/v3";
import { createAdminClient } from "@/services/supabase/server";

// 1. Define the Yelp AI Tool (Manual Definition as discussed)
async function callYelpAi(query: string) {
  const url = "https://api.yelp.com/ai/chat/v2";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  });

  if (!response.ok) {
    throw new Error(`Yelp API Error: ${await response.text()}`);
  }

  const data = await response.json();
  // Adjust this based on the actual Yelp AI response structure
  return data.message || data.response || JSON.stringify(data);
}

// 2. Define the Trigger Task
export const yelpAgentTask = task({
  id: "yelp-agent-response",
  run: async (payload: { roomId: string; userQuery: string }) => {
    // A. Call Yelp AI
    const yelpResponse = await callYelpAi(payload.userQuery);

    // B. Write response to Supabase
    const supabase = createAdminClient();

    // Use the UUID we created in the Prerequisite step
    const AI_USER_ID = process.env.AI_USER_ID!;

    const { error } = await supabase.from("message").insert({
      text: yelpResponse,
      chat_room_id: payload.roomId,
      author_id: AI_USER_ID,
    });

    if (error) {
      throw new Error(`Failed to post AI message: ${error.message}`);
    }

    return { success: true, replied: yelpResponse };
  },
});
