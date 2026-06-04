import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  try {

    const { userId } = req.body;

    const { data: existing } =
      await supabase
        .from("users")
        .select("*")
        .eq("adex_user_id", userId)
        .maybeSingle();

    if (!existing) {

      await supabase
        .from("users")
        .insert([
          {
            adex_user_id: userId
          }
        ]);
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}