import express from "express";
import cors from "cors";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.get("/api/getNotes", async (req, res) => {
  let cache = null;
  let lastFetch = 0;
  const CACHE_TTL = 1000 * 60 * 5;
  const now = Date.now();

  if (cache && now - lastFetch < CACHE_TTL) {
    return res.json(cache);
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
    });

    const data = response.results.map((page) => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
      description: page.properties?.desc?.rich_text?.[0]?.plain_text || "",
      event_date: page.properties?.event_date?.date?.start || "",
      location: page.properties?.location?.rich_text?.[0]?.plain_text || "",
      city: page.properties?.city?.rich_text?.[0]?.plain_text || "",
      category: page.properties?.category?.rich_text?.[0]?.plain_text || "",
      image: page.properties?.img?.files?.[0]?.file?.url || "",
      sign_up: page.properties?.sign_up?.rich_text?.[0]?.plain_text || "",
      detail: page.properties?.detail?.rich_text?.[0]?.plain_text || "",
    }));

    cache = data;
    lastFetch = now;

    console.log("Fetched events:", data);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const notionPartners = new Client({ auth: process.env.NOTION_TOKEN_PARTNERS });

app.get("/api/getPartners", async (req, res) => {
  const now = Date.now();
  let cache = null;
  let lastFetch = 0;
  const CACHE_TTL = 1000 * 60 * 5;
  if (cache && now - lastFetch < CACHE_TTL) {
    return res.json(cache);
  }

  try {
    const response = await notionPartners.databases.query({
      database_id: process.env.NOTION_DB_PARTNERS_ID,
    });

    const data = response.results.map((page) => ({
      id: page.id,
      name: page.properties?.name?.title?.[0]?.plain_text || "Untitled",
      link: page.properties?.link?.rich_text?.[0]?.plain_text || "",
      image: page.properties?.image?.files?.[0]?.file?.url || "",
    }));

    cache = data;
    lastFetch = now;

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});

const notionResearch = new Client({ auth: process.env.NOTION_TOKEN_RESEARCH });

app.get("/api/getResearch", async (req, res) => {
  let cache = null;
  let lastFetch = 0;
  const CACHE_TTL = 1000 * 60 * 5;
  const now = Date.now();

  if (cache && now - lastFetch < CACHE_TTL) {
    return res.json(cache);
  }

  try {
    const response = await notionResearch.databases.query({
      database_id: process.env.NOTION_DB_RESEARCH_ID,
    });

    const data = response.results.map((page) => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
      description: page.properties?.desc?.rich_text?.[0]?.plain_text || "",
      image: page.properties?.img?.files?.[0]?.file?.url || "",
      publication:
        page.properties?.publication?.rich_text?.[0]?.plain_text || "",
      status: page.properties?.status?.select?.name || "Unknown",
      keywords: page.properties?.keywords?.rich_text?.[0]?.plain_text || "",
    }));

    cache = data;
    lastFetch = now;

    console.log("Fetched events:", data);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});
