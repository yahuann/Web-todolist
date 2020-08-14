
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

var items = [];
// ["Buy Food", "Cook Food", "Eat Food"];
var workItems = [];

///////////////
const credential = require('./constants');
const url = "mongodb+srv://" + credential.cred + "@cluster0.fidxo.mongodb.net/todolistDB?retryWrites=true&w=majority"
const mongoose = require('mongoose');
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


const itemsScheme = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Please Add Name"]
  }
});
const TodoItem = mongoose.model('TodoItem', itemsScheme);

const listScheme = new mongoose.Schema({
  name: {
    type: String,

    // required: [true, "Please Add Name"]
  },
  items: [itemsScheme]
});
const List = mongoose.model('List', listScheme);

const buyFood = new TodoItem({
  name: "Buy Food - default1"
});
const cookFood = new TodoItem({
  name: "Cook Food - default2"
});
const eatFood = new TodoItem({
  name: "Eat Food - default3"

});
const day = date.getDate();



// const WorkItem = mongoose.model('WorkItem', workListScheme);


/////////////
app.get("/", function(req, res) {


  TodoItem.find(function(err, item) {
    if (err) {
      console.log(err);
    } else if (item.length === 0) {


      TodoItem.insertMany([buyFood, cookFood, eatFood], function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully");
        }
      });
      res.redirect("/");
    } else {
      items = item;
      res.render("list", {
        listTitle: day,
        newListItems: items
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const aItem = new TodoItem({
    name: itemName,
  });

  if (listName === day) {
    aItem.save().then(() => console.log('successfully'));
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, originItems) {
      originItems.items.push(aItem);
      originItems.save();
      res.redirect("/" + listName);
    });
  }
});



app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);
  List.findOne({
    name: listName
  }, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      if (!list) {
        const newList = new List({
          name: listName,
          items: [buyFood, cookFood, eatFood]
        });
        newList.save();
        res.redirect("/" + listName)
      } else {
        res.render("list", {
          listTitle: list.name,
          newListItems: list.items
        });
      }
    }
  });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/delete", function(req, res) {
  const listName = req.body.list;
  const itemId = req.body.checkbox;


  if (listName === day) {

    TodoItem.findByIdAndRemove(itemId, function(err, item) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: itemId
          }
        }
      },
      function(err, foundList) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      });

  }



});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
