import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const { conversationId, message } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({
        error: "Conversation ID and message are required"
      });
    }

    // Update title if first message
    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("title")
        .eq("id", conversationId)
        .single();

    if (conversationError) {
      console.log("Conversation fetch error:", conversationError);
    }

    if (
      conversation &&
      (
        conversation.title === "New Chat" ||
        conversation.title === null ||
        conversation.title === ""
      )
    ) {
      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          title:
            message.length > 30
              ? message.substring(0, 30) + "..."
              : message
        })
        .eq("id", conversationId);

      if (updateError) {
        console.log("Title update error:", updateError);
      }
    }

    // Call OpenRouter
    const response = await axios.post(
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
        }
      }
    );

    console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "OK" : "MISSING");
    console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "OK" : "MISSING");
    console.log("Conversation ID:", conversationId);
    console.log("Message:", message);

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response received";

    // Save messages
    const { error: messageError } =
      await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "user",
            content: message
          },
          {
            conversation_id: conversationId,
            role: "assistant",
            content: reply
          }
        ]);

    if (messageError) {
      console.log("Message save error:", messageError);
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.response?.data || error.message
    });
  }
}