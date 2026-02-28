const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: true,
      }),
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          res.write(parsed.response);
        }
      }
    }

    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating response");
  }
});
app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});