const { createClient }
    = require("@supabase/supabase-js");

const supabase =
    createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

module.exports =
    async (req, res) => {

        const { id } =
            req.query;

        const { data } =
            await supabase
                .from("messages")
                .select("*")
                .eq(
                    "conversation_id",
                    id
                )
                .order(
                    "created_at"
                );

        res.json(data);

    };