const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                error: "Method not allowed"
            });
        }

        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        await supabase
            .from("chat_messages")
            .insert([
                {
                    session_id: sessionId,
                    role: "user",
                    message
                }
            ]);

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

        const aiReply =
            response.data.choices[0].message.content;

        await supabase
            .from("chat_messages")
            .insert([
                {
                    session_id: sessionId,
                    role: "assistant",
                    message: aiReply
                }
            ]);

        res.status(200).json({
            reply: aiReply
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};