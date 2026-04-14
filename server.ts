import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    console.log("OpenAI API Key \ud655\uc778\ub428.");
  } else {
    console.warn("OpenAI API Key \uc5c6\uc74c. AI \uc6b4\uc138 \uae30\ub2a5\uc774 \ube44\ud65c\uc131\ud654\ub429\ub2c8\ub2e4.");
  }

  app.post("/api/ai-fortune", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key\uac00 \uc5c6\uc2b5\ub2c8\ub2e4." });

    const { name, saju, ohaeng } = req.body;
    if (!name || !saju) return res.status(400).json({ error: "\uc785\ub825\uac12\uc774 \ubd80\uc871\ud569\ub2c8\ub2e4." });

    const client = new OpenAI({ apiKey });
    const formatPillar = (p: any) => `${p?.sky ?? ""}${p?.earth ?? ""}`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: "\ub108\ub294 \uc2dc\ud5d8\uae30\uac04 \ub300\ud559\uc0dd\ub4e4\uc758 \uc6b4\uba85\uc744 \uc77d\ub294 \uac74\uc870\ud55c \ud329\ud3ed \ubb34\ub2f9\uc774\ub2e4.\n\n\uc544\ub798 [\uc624\ud589 \uacb0\uacfc]\ub97c \uae30\ubc18\uc73c\ub85c \uc2dc\ud5d8\uae30\uac04 \uc0c1\ud669\uc5d0 \ub9de\uac8c \ud574\uc11d\ud558\ub418,\n\uacb0\uacfc\ub97c \uc9c1\uc811 \uc124\uba85\ud558\uc9c0 \ub9d0\uace0 \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub179\uc5ec\ub77c.\n\n[\ucd9c\ub825 \ud615\uc2dd]\n\ubc18\ub4dc\uc2dc \ud55c \uc904, \ub450 \ubb38\uc7a5\uc73c\ub85c\ub9cc \uc791\uc131\ud558\ub77c.\n(\ub0b4\uc6a9)\ud558\ub2c8\ub77c, (\ub0b4\uc6a9)\ub3c4\ub2e4.\n80\uc790 \uc774\ub0b4.\n\n[\uad6c\uc131]\n- \uccab \ubb38\uc7a5: \uc624\ud589 \ud750\ub984\uc744 \uc2dc\ud5d8\uae30\uac04 \uc0c1\ud669\uc5d0 \uc2a4\ubbf8\ub4e4\uac8c \ud45c\ud604 (\uacf5\ubd80, \ud658\uacbd, \uc5f0\uc560 \ub4f1)\n- \ub450 \ubc88\uc9f8 \ubb38\uc7a5: \ubc18\uc804 \uad6c\uc870\uc758 \ud329\ud3ed + \ud604\uc2e4\uc801\uc778 \ud589\ub3d9 \ubc29\ud5a5\n\n[\ud45c\ud604 \uac00\uc774\ub4dc]\n- \ub9d0\ud22c\ub294 \ub2f4\ubc31\ud558\uace0 \uac74\uc870\ud558\uac8c (~\uac19\ub2e4 \ub290\ub08c)\n- \uac00\ubcd5\uac8c \ud53c\uc2dd \uc6c3\uae30\ub294 \ud604\uc2e4 \uae30\ubc18 \uc720\uba38\n- \uacfc\ud55c \ucf58\uc149, \uc5b5\uc9c0 \ube44\uc720 \uae08\uc9c0\n\n[\ucf58\ud150\uce20 \ubc94\uc704]\n- \ud559\uc2b5: \ubca8\ub77c\uce58\uae30, \uc9d1\uc911\ub825 \ubd95\uad34, \uacc4\ud68d \uc2e4\ud328\n- \ud589\ub3d9: \ubbf8\ub8e8\uae30, \uc720\ud29c\ube0c/\ub137\ud50c\ub9ad\uc2a4 \ub3c4\ud53c, \ub099\ubc24 \ub4a4\uc9d1\ud790\n- \ud658\uacbd: \ub3c4\uc11c\uad00, \uc9d1, \uce74\ud398, \uac15\uc758\uc2e4\n- \uc2dc\uc2a4\ud15c: \uacfc\uc81c, \uc2dc\ud5d8, \ucd9c\uacb0, \uc7ac\uc218\uac15, \uc131\uc801\n- \uc5f0\uc560: \uc2dc\ud5d8\uae30\uac04 \uc378, \uc9dd\uc0ac\ub791, \uac19\uc740 \uacf5\uac04, \uacf5\ubd80 \ud551\uacc4 \uc811\uadfc, \uc2dc\ud5d8 \ud6c4 \ud754\uc9c0\ubd80\uc9c0\n\u2192 \uc704 \uc694\uc18c\ub4e4\uc744 \uc0c1\ud669 \uc911\uc2ec\uc73c\ub85c \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub179\uc5ec\ub77c\n\n[\ubb38\ubc95 \uaddc\uce59]\n- \ubc18\ub4dc\uc2dc \"(\ub0b4\uc6a9)\ud558\ub2c8\ub77c, (\ub0b4\uc6a9)\ub3c4\ub2e4\" \ud55c \uc904 \uad6c\uc870\n- \"\ud558\ub2c8\ub77c\": \uc0c1\ud0dc/\ud615\uc6a9\uc0ac\ub9cc (\ub3d9\uc0ac \uae08\uc9c0)\n- \"\ub3c4\ub2e4\": \uba85\uc0ac \uacb0\ub860\ub9cc (\ub3d9\uc0ac\u00b7\uc5f0\uacb0\uc5b4\ubbf8 \uae08\uc9c0)\n\n[\uae08\uc9c0]\n- \uc624\ud589 \uacb0\uacfc \uc9c1\uc811 \uc124\uba85\n- \ubb38\uc7a5 \ucd94\uac00\n- \ud615\uc2dd \ubcc0\ud615\n\n[\uc608\uc2dc]\n\uc9d1\uc911\uc740 \ub418\ub098 \uc624\ub798 \ubabb \ubc84\ud2f0\ub294 \ud750\ub984\uc774\ub2c8\ub77c, \uacb0\uad6d \ub8e8\ud2f4\uc774 \uc0b4\uae38\uc774\ub3c4\ub2e4.",
          },
          {
            role: "user",
            content: `\uc774\ub984: ${name}\n\uc0ac\uc8fc: \uc5f0\uc8fc ${formatPillar(saju.year)} / \uc6d4\uc8fc ${formatPillar(saju.month)} / \uc77c\uc8fc ${formatPillar(saju.day)} / \uc2dc\uc8fc ${formatPillar(saju.hour)}\n[\uc624\ud589 \uacb0\uacfc] ${ohaeng || "\uc815\ubcf4 \uc5c6\uc74c"}`,
          },
        ],
      });

      const fortune = response.choices[0]?.message?.content?.trim();
      if (!fortune) return res.status(500).json({ error: "\uc751\ub2f5\uc774 \ube44\uc5b4\uc788\uc2b5\ub2c8\ub2e4." });

      res.json({ fortune });
    } catch (error: any) {
      console.error("OpenAI \uc624\ub958:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subj-comment", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key\uac00 \uc5c6\uc2b5\ub2c8\ub2e4." });

    const { subject, keywords } = req.body;
    if (!subject || !keywords) return res.status(400).json({ error: "\uc785\ub825\uac12\uc774 \ubd80\uc871\ud569\ub2c8\ub2e4." });

    const client = new OpenAI({ apiKey });

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: "\ub108\ub294 \uacfc\ubaa9\ubcc4 \uc6b4\uba85\uc744 \uaf3f\ub5a4\ub294 \uc5ed\uc220\uac00\ub2c8\ub77c.\n\uc785\ub825\ub41c \uacfc\ubaa9\uba85\uacfc \uc624\ud589 \uc18d\uc131\uc744 \ubc14\ud0d5\uc73c\ub85c \uc544\ub798 \ud615\uc2dd\uc5d0 \ub9de\uac8c \ucd9c\ub825\ud558\uac70\ub77c.\n\n[\ucd9c\ub825 \ud615\uc2dd]\n\uccab\uc9f8 \uc904: \ud574\ub2f9 \uacfc\ubaa9\uc758 \ud2b9\uc131(\uc554\uae30\ub7c9, \uacc4\uc0b0, \uae00\uc4f0\uae30, \uc601\uc5b4 \ub4f1)\uc744 \uc624\ud589 \uc0c1\uadf9\u00b7\uc0c1\uc0dd\uc73c\ub85c \ubb18\uc0ac\ud558\uac70\ub77c.\n         \uacfc\ubaa9\uba85\uc740 \uc5b8\uae09\ud558\uc9c0 \ub9d0\uac70\ub77c. 25\uc790 \uc774\ub0b4. \"~\ud558\ub2c8\ub77c, ~\ub3c4\ub2e4\" \ub9d0\ud22c \uc720\uc9c0.\n\ub458\uc9f8 \uc904: \ube48\uc904\n\uc14b\uc9f8 \uc904: \"Tip: \"\uc73c\ub85c \uc2dc\uc791\ud558\uac70\ub77c.\n         \uc544\ub798 Tip \uc720\ud615 \uc911 \ud558\ub098\ub97c \ubc18\ub4dc\uc2dc \uc120\ud0dd\ud558\uc5ec \uc791\uc131\ud558\uac70\ub77c.\n         30\uc790 \uc774\ub0b4.\n\n[Tip \uc720\ud615 \u2014 \ubc18\ub4dc\uc2dc \ub458 \uc911 \ud558\ub098\ub9cc \uc120\ud0dd\ud558\uac70\ub77c]\n\n\uc720\ud615 A. \uc624\ud589 \uacf5\ubd80 \ud658\uacbd \ud301\n- \uc624\ud589 \uae30\uc6b4\uc5d0 \ub9de\ub294 \ud604\uc2e4\uc801\uc778 \uacf5\ubd80 \ubc29\ubc95 \ucd94\ucc9c\n- \uc7a5\uc18c, \uc2dc\uac04\ub300, \uacf5\ubd80 \ubc29\uc2dd, \uc2dd\uc2b5\uad00, \ub8e8\ud2f4 \ub4f1\n- \uc2e4\uc81c\ub85c \ub3c4\uc6c0\uc774 \ub418\ub294 \ub0b4\uc6a9\ub9cc\n\n\uc720\ud615 B. \uc810\uc7f9\uc774 \ub4dc\ub9bd \ud301\n- \uc2dc\ud5d8\uc7a5 \uc790\ub9ac, \ubc29\ud5a5, \uc2dc\uac04, \uc22b\uc790, \ud544\uae30\uad6c \uc0c9 \ub4f1 \ud65c\uc6a9\n- \uc624\ud589\uacfc \uc5b5\uc9c0\ub85c \uc5f0\uacb0\ud558\ub418 \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub9d0\ud558\uac70\ub77c\n- \uc9c4\uc9c0\ud55c \ub9d0\ud22c + \ud669\ub2f9\ud55c \ub0b4\uc6a9 \uc870\ud569\n- \uc608\uce21 \ubd88\uac00\ub2a5\ud558\uace0 \uac00\ubcfc\uac8c \uc6c3\uae38 \uac83\n\n[\uc120\ud0dd \uaddc\uce59]\n- \uc720\ud615 A\uc640 B\ub97c 50:50 \ud655\ub960\ub85c \ub79c\ub364 \uc120\ud0dd\ud558\uac70\ub77c\n- \uac19\uc740 \uc720\ud615\uc774 \uc5f0\uc18d 3\ubc88 \uc774\uc0c1 \ub098\uc624\uc9c0 \uc54a\ub3c4\ub85d \ud558\uac70\ub77c\n\n[\uacf5\ud1b5 \uaddc\uce59]\n- \uc624\ud589 \uc6a9\uc5b4(\u6728\u706b\u571f\u91d1\u6c34)\ub294 \uc804\uccb4\uc5d0\uc11c \ud55c \ubc88\ub9cc \uc0ac\uc6a9\n- \uacfc\ubaa9\uba85 \uc5b8\uae09 \uae08\uc9c0\n- \ubd88\ud544\uc694\ud55c \uc124\uba85 \uae08\uc9c0\n- \uccab \uc904 \uc2dc\uc791 \ubc29\uc2dd \ub9e4\ubc88 \ub2e4\ub974\uac8c \ud560 \uac83\n- \ub450 \uc904 \uc678 \ucd94\uac00 \ucd9c\ub825 \uae08\uc9c0",
          },
          {
            role: "user",
            content: `\uc2dc\ud5d8 \uacfc\ubaa9: ${subject}\n\uc0ac\uc8fc/\uc6b4\uc138: ${keywords}`,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) return res.status(500).json({ error: "\uc751\ub2f5\uc774 \ube44\uc5b4\uc788\uc2b5\ub2c8\ub2e4." });
      const comment = raw.includes('Tip:')
        ? raw.replace(/\n*(Tip:)/, '\n$1')
        : raw;

      res.json({ comment });
    } catch (error: any) {
      console.error("OpenAI \uacfc\ubaa9 \ucf54\uba58\ud2b8 \uc624\ub958:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\uc11c\ubc84 \uc2e4\ud589 \uc911: http://localhost:${PORT}`);
  });
}

startServer();
