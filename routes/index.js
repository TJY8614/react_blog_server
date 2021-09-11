var express = require("express");
var router = express.Router();
var db = require("../model/db");
var fs = require("fs");
//oss
var co = require("co");
const OSS = require("ali-oss");
const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: "oss-cn-beijing",
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: "LTAI5tCDfz6m96nUhCbZ7xBt",
  accessKeySecret: "pKIjdt6GhwnT7PDgdZ9y8u3CR4oFjJ",
  // 填写Bucket名称。
  bucket: "tjy-blog",
});
var ali_oss = {
  bucket: "tjy-blog",
  endPoint: "oss-cn-beijing.aliyuncs.com",
};
// 微信小程序 图片上传
var multer = require("multer");
var upload = multer({ dest: "./img/" });

// 图片上传
router.post("/api/upload", upload.single("file"), function (req, res, next) {
  // console.log(req.file);
  // 文件路径
  var filePath = "./" + req.file.path;
  // 文件类型
  var temp = req.file.originalname.split(".");
  var fileType = temp[temp.length - 1];
  var lastName = "." + fileType;
  // 构建图片名
  var fileName = Date.now() + lastName;
  // 图片重命名
  fs.rename(filePath, fileName, (err) => {
    if (err) {
      res.end(JSON.stringify({ status: "102", msg: "文件写入失败" }));
    } else {
      var localFile = "./" + fileName;
      var key = fileName;
      // 阿里云 上传文件
      co(function* () {
        client.useBucket(ali_oss.bucket);
        var result = yield client.put(key, localFile);
        var imageSrc =
          "https://tjy-blog.oss-cn-beijing.aliyuncs.com/" + result.name;
        // 上传之后删除本地文件
        fs.unlinkSync(localFile);
        res.end(
          JSON.stringify({ status: "100", msg: "上传成功", imageUrl: imageSrc })
        );
      }).catch(function (err) {
        // 上传之后删除本地文件
        fs.unlinkSync(localFile);
        res.end(
          JSON.stringify({
            status: "101",
            msg: "上传失败",
            error: JSON.stringify(err),
          })
        );
      });
    }
  });
});

router.get("/", function (req, res) {
  res.send("测试");
});

//注册接口
router.post("/api/admin/signup", function (req, res) {
  new db.User(req.body.userInfo).save(function (err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send();
  });
});

//登录接口
router.post("/api/admin/signin", function (req, res) {
  let userInfo = req.body.userInfo;
  db.User.find(userInfo, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    if (docs.length > 0) {
      res.send("success");
    } else {
      res.send("fail");
    }
  });
});

// 根据用户名获取用户
router.get("/api/admin/getUser/:name", function (req, res) {
  db.User.findOne({ name: req.params.name }, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.send(docs);
  });
});

// 获取所有文章
router.get("/api/blogList", function (req, res) {
  db.Article.find({}, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.json(docs.reverse());
  });
});

// 获取所有标签
router.get("/api/blogLabels", function (req, res) {
  db.Article.find({}, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.json(
      docs
        .map((item) => {
          return item.labels.toString();
        })
        .join(",")
    );
  });
});

// 文章详情页
router.get("/api/blogDetail/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id }, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.send(docs);
  });
});

// 文章保存
router.post("/api/admin/saveBlog", function (req, res) {
  new db.Article(req.body.articleInformation).save(function (err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send();
  });
});

// 文章更新
router.post("/api/admin/updateBlog", function (req, res) {
  let info = req.body.articleInformation;
  db.Article.find({ _id: info._id }, function (err, docs) {
    if (err) {
      return;
    }
    docs[0].title = info.title;
    docs[0].date = info.date;
    docs[0].imgUrl = info.imgUrl;
    docs[0].content = info.content;
    docs[0].labels = info.labels;
    db.Article(docs[0]).save(function (err) {
      if (err) {
        res.status(500).send();
        return;
      }
      res.send();
    });
  });
});

// 文章删除
router.post("/api/admin/deleteBlog", function (req, res) {
  db.Article.remove({ _id: req.body._id }, function (err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send();
  });
});

//提交留言
router.post("/api/message", function (req, res) {
  new db.Message(req.body.message).save(function (err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send();
  });
});

//留言列表
router.post("/api/messageList", function (req, res) {
  db.Message.find({}, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.json(docs.reverse());
  });
});

//提交留言回复
router.post("/api/messageReply", function (req, res) {
  new db.Reply(req.body.reply).save(function (err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send();
  });
});

//回复列表
router.post("/api/replyList", function (req, res) {
  db.Reply.find({}, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.json(docs.reverse());
  });
});

//关键字搜索
router.post("/api/keyFind", function (req, res) {
  var findval = new RegExp(req.body.findval); //查询的时候判断条件加 new RegExp( )即可变成关键字搜索
  db.Article.find({ content: findval }, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    res.json(docs);
  });
});

module.exports = router;
