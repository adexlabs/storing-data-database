const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const { message } = req.body;

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

  } catch (error) {

    console.log(error.response?.data);

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }

};