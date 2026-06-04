import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      OPENROUTER_API_KEY
    } = process.env;

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !OPENROUTER_API_KEY
    ) {
      return res.status(500).json({
        error: "Missing environment variables"
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const { conversationId, message, userId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        error: "conversationId required"
      });
    }

    if (!message) {
      return res.status(400).json({
        error: "message required"
      });
    }

    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

    if (conversationError) {
      return res.status(500).json({
        error: conversationError.message
      });
    }

    if (
      conversation.title === "New Chat" ||
      !conversation.title
    ) {
      await supabase
        .from("conversations")
        .update({
          title: message.substring(0, 30)
        })
        .eq("id", conversationId);
    }

    await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: "user",
          content: message,
          user_id: userId
        }
      ]);

    const aiResponse = await axios.post(
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
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      aiResponse.data?.choices?.[0]?.message?.content ||
      "No response";

    await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: "assistant",
          content: reply
        }
      ]);

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
}