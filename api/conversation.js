import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          title: "New Chat"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}