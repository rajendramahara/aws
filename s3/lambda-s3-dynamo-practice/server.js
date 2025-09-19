const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/objects", (req, res) => {
    res.sendFile(path.join(__dirname, "public/objects/index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Local form running: http://localhost:${PORT}`);
});