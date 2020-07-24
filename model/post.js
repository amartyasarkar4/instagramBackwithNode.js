var mongoose=require("mongoose");
const {ObjectId}=mongoose.Schema.Types;
const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
   caption:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    author:{
        type:ObjectId,
        ref:"User"
    },
    likes:[{
        type:ObjectId,
       ref:"User"
    }],
    comments:[{
        commentator:{
            type:ObjectId,
            ref:"User"
        },
        opinion:{
            type:String,
            required:true
        }
    }]
})
mongoose.model("postcreate",postSchema);