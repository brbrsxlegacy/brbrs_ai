import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

app.get("/health", (req, res) => {
  res.json({ ok: true, name: "brbrs AI Pro" });
});

app.post("/chat", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        reply: "API key yok kanka. Render Environment kısmına OPENAI_API_KEY ekle."
      });
    }

    const userMessage = String(req.body.message || "").trim();
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-10) : [];

    if (!userMessage) {
      return res.json({ reply: "Bir şey yaz kanka." });
    }

    const messages = [
      {
        role: "system",
        content:
          "Sen brbrs AI'sın. Türkçe konuş. Kanka tarzında samimi, hızlı, akıllı cevap ver. Gereksiz uzatma ama kullanıcı isterse detaylı anlat. Kod sorularında net dosya adı ve adım ver. Kötüyse kötü de."
      },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "")
      })),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.75,
      max_tokens: 900
    });

    const reply = response.choices?.[0]?.message?.content || "Cevap gelmedi kanka.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: err?.message || "Bilinmeyen hata oldu kanka."
    });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`brbrs AI çalışıyor: http://localhost:${PORT}`);
});
