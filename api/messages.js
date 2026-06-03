import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  const { id } = req.query;

  const { data, error } =
    await supabase
      .from("messages")
      .select("*")
      .eq(
        "conversation_id",
        id
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}