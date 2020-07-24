var express=require("express");
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var app=express();
var http=require("http");
require("./model/user");
require("./model/post");
var server=http.createServer(app);

mongoose.connect("mongodb://localhost/Myinstragram",{useNewUrlParser:true,useFindAndModify: false},(error)=>{
    if(!error){
        console.log("Success");
    }else{
        console.log("Fail to connect with mogoose");
    }
})
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
const customMiddleweres=(req,res,next)=>{
    console.log("Middlewere executed ....");
    next();
}
app.use(express.json());
app.use(customMiddleweres);
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/otherUsers"));
/*
var blogSchema=new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.new}
});
var Blog=mongoose.model("Myinstragram",blogSchema);
Blog.create({
    title:"Amartya Sarkar's First Project",
    image:"https://images.pexels.com/photos/1166473/pexels-photo-1166473.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    body:"A Beautiful baby girl ,see how cute is this....",
    created:new Date()
});
app.get("/",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("SomeThing Worng!!");
        }else{
            res.render("home",{blogs:blogs});
        }
    })
    
});
app.get("/ami",function(req,res){
    res.send("<h1 style='color:red'>Hey Amartya here </h1>");
});
app.get("/amar",function(req,res){
    res.send("<h1 style='color:green'>Hey Instagram here </h1>");
});*/
server.listen(5000,'localhost',function(){
    console.log("Server is Listening on Port 3000");
});