//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
const password = "cHPsBRX3NVkELf8"


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_mathieu:"+ password +"@cluster0.avw0s.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

// ItemSchema
const itemsSchema = new mongoose.Schema({
  name:String
});

// Mongoose model
const Item = mongoose.model("Item", itemsSchema)

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        //create a new list
        const list = new List ({
          name: customListName,
        })
        list.save();
        res.redirect("/" + customListName)
      } else {
        //Show a existing list
        res.render("List", {listTitle:foundList.name, newListItems: foundList.items})
      }
    }
  })
 })


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name:itemName
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    }) 
  }
});


app.post("/delete", function(req,res){

  const deletedItem = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(deletedItem, function (err) {
      if(!err){
          console.log("Your item has been removed from your Todo list!")
          res.redirect("/")
      }
  });
  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:deletedItem}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
    });
  }

});

let port = process.env.PORT;

if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
