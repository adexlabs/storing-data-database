export default async function handler(req, res) {

    if (req.method === "GET") {
        return res.status(200).json({
            success: true,
            message: "API is working"
        });
    }

    // rest of your code...
}

export default async function handler(req, res) {
    return res.status(200).json({
        SUPABASE_URL: process.env.SUPABASE_URL || "MISSING",
        SUPABASE_SERVICE_ROLE_KEY:
            process.env.SUPABASE_SERVICE_ROLE_KEY
                ? "FOUND"
                : "MISSING",
        OPENROUTER_API_KEY:
            process.env.OPENROUTER_API_KEY
                ? "FOUND"
                : "MISSING"
    });
}