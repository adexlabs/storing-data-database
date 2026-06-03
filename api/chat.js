import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const { conversationId, message } = req.body;

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

        console.log(
            JSON.stringify(response.data, null, 2)
        );

        const reply =
            response.data.choices[0].message.content;

        if (conversationId) {
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