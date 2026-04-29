const axios = require("axios");

exports.getGames = async (req, res) => {
  const { search = "", page = 1, ordering, lang, metacritic } = req.query;

  try {
    const response = await axios.get(
      "https://api.rawg.io/api/games",
      {
        params: {
          key: process.env.RAWG_KEY,
          search,
          page,
          page_size: 20,
          ordering,
          lang: 'en',
          metacritic: '1,100',
        },
        timeout: 10000,
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching games" });
  }
};


exports.getGameById = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/games/${req.params.id}`,
      {
        params: {
          key: process.env.RAWG_KEY,
        },
        timeout: 10000, // 10 seconds
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching game" });
  }
};