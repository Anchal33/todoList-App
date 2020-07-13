const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const lodash = require('lodash');
const dotenv = require('dotenv').config();
const app=express();

mongoose.connect(process.env.MONGOLAB_URL,{useUnifiedTopology: true,useNewUrlParser:true});


const itemSchema={
  name:{
    type:String,
    required:[1]
  }
}
let flag=0;
const Item= mongoose.model('item',itemSchema);

const item1=new Item({
  name:"Welcome to your todolist !"
})
const item2=new Item({
  name:"Hit + button to add a new item"
})
const item3=new Item({
  name:"Hit the icon to delete an item"
})
const defaultItems=[item1,item2,item3];

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));


app.get("/",function(req,res){

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0 && flag===0){
      flag=1;
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("error");
        }
        else{
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else{
res.render("list",{listTitle:"Today",newListItem:foundItems})
}
})

});
app.post("/",function(req,res){
  const title=req.body.button;
  const newItem=new Item({
    name:req.body.newItem
  });
  if(title==="Today"){
  newItem.save();
  res.redirect("/");
}
else{
  List.findOne({name:title},function(err,found){
  found.items.push(newItem);
  found.save();
  res.redirect("/"+title);
})
}
});

app.post("/delete",function(req,res){
const id =req.body.button;
const title=req.body.title;
if(title==="Today"){
Item.findByIdAndRemove(id,function(err){
  if(err){
    console.log("can not delete");
  }
  else{
    res.redirect("/");
  }
})
}
else{
  List.findOneAndUpdate({name:title},{$pull:{items:{_id:id}}},function(err){
    if(!err){
      res.redirect("/"+title);
    }

  })
}
})

const listSchema={
  name:{
    type:String,
    required:[1]
  },
  items:{
    type:[itemSchema],
    required:[1]
  }
}

const List= mongoose.model('List',listSchema);

app.get("/:list",function(req,res){
  const customList=lodash.capitalize(req.params.list);
List.findOne({name:customList},function(err,found){
  if(!err){
    if(!found){
    //create a list
    const list=new List({
      name:customList,
      items:defaultItems
    })
    list.save();
    res.redirect("/"+customList);
    }
  else{
    res.render("list",{listTitle:found.name,newListItem:found.items})
  }
}
})
});



app.listen(process.env.PORT || 3000,function(){
  console.log("server is running");
});
