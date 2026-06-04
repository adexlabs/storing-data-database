import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Allow only POST
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // Check environment variables
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.OPENROUTER_API_KEY
    ) {
      return res.status(500).json({
        error: "Missing environment variables"
      });
    }

    const { conversationId, message } = req.body;

    console.log("Conversation ID:", conversationId);
    console.log("Message:", message);

    if (!conversationId) {
      return res.status(400).json({
        error: "conversationId is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        error: "message is required"
      });
    }

    // Get conversation
    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

    if (conversationError) {
      console.error("Conversation fetch error:", conversationError);

      return res.status(500).json({
        error: "Conversation not found"
      });
    }

    // Update title if still "New Chat"
    if (
      conversation.title === "New Chat" ||
      !conversation.title
    ) {
      const { error: updateError } =
        await supabase
          .from("conversations")
          .update({
            title:
              message.length > 30
                ? message.substring(0, 30) + "..."
                : message
          })
          .eq("id", conversationId);

      if (updateError) {
        console.error("Title update error:", updateError);
      }
    }

    // Save user message
    const { error: userInsertError } =
      await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "user",
            content: message
          }
        ]);

    if (userInsertError) {
      console.error("User message save error:", userInsertError);
    }

    // OpenRouter API call
    const openRouterResponse =
      await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: message
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

    const reply =
      openRouterResponse.data?.choices?.[0]?.message?.content ||
      "No response received";

    // Save AI message
    const { error: aiInsertError } =
      await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "assistant",
            content: reply
          }
        ]);

    if (aiInsertError) {
      console.error("AI message save error:", aiInsertError);
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
}