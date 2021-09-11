const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/reactBlog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

const articleSchema = new mongoose.Schema({
  title: String,
  imgUrl: String,
  date: String,
  content: String,
  labels: Array,
});

const messageSchema = new mongoose.Schema({
  name: String,
  date: String,
  content: String,
  reply: String,
  replyName: String,
  replyTime: String,
});

const replySchema = new mongoose.Schema({
  id: String,
  reply: String,
  replyName: String,
  replyTime: String,
});

const Models = {
  User: mongoose.model("User", userSchema),
  Article: mongoose.model("Article", articleSchema),
  Message: mongoose.model("Message", messageSchema),
  Reply: mongoose.model("Reply", replySchema),
};

module.exports = Models;
