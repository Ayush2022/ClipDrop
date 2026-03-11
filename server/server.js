const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");

const Snippet = require("./models/Snippet");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch(err => {
  console.log("MongoDB connection error:", err);
});

app.post("/paste", async (req, res) => {

    const code = nanoid(6);

    const snippet = new Snippet({
        code: code,
        text: req.body.text
    });

    await snippet.save();

    res.json({ code });

});

app.get("/get/:code", async (req, res) => {

    const snippet = await Snippet.findOne({ code: req.params.code });

    if (!snippet) {
        return res.status(404).json({ message: "Not found" });
    }

    res.json(snippet);

});

app.put("/update/:code", async (req, res) => {

    const snippet = await Snippet.findOneAndUpdate(
        { code: req.params.code },
        { text: req.body.text },
        { new: true }
    );

    if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
    }

    res.json({ message: "Snippet updated successfully" });

});

app.put("/update/:code", async (req, res) => {

    const snippet = await Snippet.findOneAndUpdate(
        { code: req.params.code },
        { text: req.body.text },
        { new: true }
    );

    if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
    }

    res.json({ message: "Snippet updated successfully" });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});