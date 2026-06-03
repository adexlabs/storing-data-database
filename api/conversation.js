const { createClient }
    = require("@supabase/supabase-js");

const supabase =
    createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

module.exports =
    async (req, res) => {

        const { data } =
            await supabase
                .from("conversations")
                .insert([
                    {
                        title: "New Chat"
                    }
                ])
                .select()
                .single();

        res.json(data);

    };