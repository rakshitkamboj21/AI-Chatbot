import axios from "axios";

export async function searchGoogle(query) {
  try {
    const res = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: process.env.SERPAPI_KEY,
        engine: "google",
        num: 5, // top 5 results
      },
    });

    const results = res.data.organic_results || [];
    return results.map((r) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
    }));
  } catch (err) {
    console.error("Search error:", err.message);
    return [
      { title: "Error", link: "", snippet: "Failed to fetch results" },
    ];
  }
}
