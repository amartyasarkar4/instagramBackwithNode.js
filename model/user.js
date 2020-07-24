var mongoose=require("mongoose");
/*mongoose.connect("mongodb://localhost/Myinstragram",{useNewUrlParser:true},(error)=>{
    if(!error){
        console.log("Success from scema");
    }else{
        console.log("Fail to connect with mogoose");
    }
})*/
const {ObjectId}=mongoose.Schema.Types;
var newUserSchema=new mongoose.Schema({
    name:{
       type:String,
       required:true
    },
    email:{
       type:String,
       required:true
    },
    username:{
       type:String,
       required:true
    },
    password:{
       type:String,
       required:true
    },
    resetPasswordToken:String,
    expireToken:String,
    created:{type:Date,default:new Date()},
    followers:[{
        type:ObjectId,
        ref:"User"
    }],
    following:[{
        type:ObjectId,
        ref:"User"
    }],
    photoId:{
        type:String,
        required:false
    },
    bio:{
        type:String,
        required:false
    },
    website:{
        type:String,
        required:false
    },
    phoneNo:{
        type:Number,
        required:false
    },
    gender:{
        type:String,
        required:false
    }
});

mongoose.model("User",newUserSchema);