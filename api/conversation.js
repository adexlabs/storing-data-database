import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export default async function handler(req, res) {

  try {

    const supabase =
      createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

    const {
      title,
      userId
    } = req.body;

    const id =
      crypto.randomUUID();

    const { error } =
      await supabase
        .from("conversations")
        .insert([
          {
            id,
            title,
            user_id: userId
          }
        ]);

    if (error) throw error;

    return res.status(200).json({
      id
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}