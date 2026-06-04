import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { id } = req.query;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .eq("user_id", userId)
      .order("created_at", {
        ascending: true
      });

    if (error) throw error;

    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}