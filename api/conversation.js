import { supabase } from "./supabase.js";
import crypto from "crypto";

export default async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res
            .status(405)
            .json({
                error:
                    "Method not allowed"
            });
    }

    try {

        const {
            title,
            userId
        } = req.body;

        const id =
            crypto.randomUUID();

        const { error } =
            await supabase
                .from(
                    "conversations"
                )
                .insert([
                    {
                        id,
                        title,
                        user_id:
                            userId
                    }
                ]);

        if (error) {

            return res
                .status(500)
                .json({
                    error:
                        error.message
                });
        }

        return res.json({
            id
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                error:
                    err.message
            });
    }
}