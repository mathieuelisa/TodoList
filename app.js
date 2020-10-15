//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

// ItemSchema
const itemsSchema = new mongoose.Schema({
  name:String
});

// Mongoose model
const Item = mongoose.model("Item", itemsSchema)

// DefautItems
const react = new Item({
  name:"Learn ReactJS"
})

const jquery = new Item({
  name:"Understand Jquery"
})

const babel = new Item({
  name:"Learn Babel"
})

const defaultItems = [react,jquery,babel]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {

 Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err)
      } else{
        console.log("Your defaults items have been added with success")
      }
    })
    res.redirect("/")
  } else {
    res.render("list", {listTitle: "TODAY", newListItems: foundItems});
  }
 })
});


app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        //create a new list
        const list = new List ({
          name: customListName,
          items: defaultItems
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

  if(listName === "TODAY"){
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

  Item.findByIdAndRemove(deletedItem, function (err) {
    if(!err){
        console.log("Your item has been removed from your ToDo list")
    }
    res.redirect("/")
});
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
