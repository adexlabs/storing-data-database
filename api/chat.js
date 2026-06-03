import { createClient } from "@supabase/supabase-js";
import axios from "axios";


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
export default async function handler(req, res) {
    try {
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

        const reply =
            response.data.choices[0].message.content;

        res.json({
            reply
        });

        // return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            error: error.response?.data || error.message
        });
    }
}