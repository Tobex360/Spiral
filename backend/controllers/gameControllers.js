const axios = require("axios");

exports.getGames = async (req, res) => {
  const { search = "", page = 1 } = req.query;

  try {
    const response = await axios.get(
      "https://api.rawg.io/api/games",
      {
        params: {
          key: process.env.RAWG_KEY,
          search,
          page,
          page_size: 20,
        },
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching games" });
  }
};