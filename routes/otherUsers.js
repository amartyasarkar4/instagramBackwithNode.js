var express=require("express");
var router=express.Router();
var mongoose=require("mongoose");
var Post=mongoose.model("postcreate");
var User=mongoose.model("User")
var requireLogin=require("../middleware/requireLogin");

router.get("/otherUsers/:userId",requireLogin,(req,res)=>{
    console.log(req.params.userId);
    console.log("params shown")
    User.findOne({_id:req.params.userId})
    .select("-password")
    .populate("followers","_id name")
    .then(user=>{
        Post.find({author:req.params.userId})
        .populate("author","_id name")
        .exec((err,post)=>{
            if(err){
                return res.status(423).json({error:err})
            }
            res.json({user,post})
        })
    }).catch(err=>{
        return res.status(404).json({error:"User Not Found !!!.."})
    })
})
router.put("/follow",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.userId,{
        $push:{followers:req.user._id}
    },{
        new:true
    })
    .populate("followers","_id name")
    .exec((err,user)=>{
        if(err){
            res.status(422).json({error:err})
        }else{
            Post.find({author:req.body.userId})
            .populate("author","_id name")
            .exec((err,post)=>{
                 if(err){
                     return res.status(423).json({error:err})
                 }
               else if(post){
                User.findByIdAndUpdate(req.user._id,{
                    $push:{following:req.body.userId}
                },{
                    new:true
                }).exec((err,following)=>{
                    if(err){
                        res.status(422).json({error:err})
                    }else{
                        res.json({user,post,message:"successfully Following"});
                    }
                })
            }
        })
        }
    })
})
router.put("/unfollow",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.userId,{
        $pull:{followers:req.user._id}
    },{
        new:true
    })
    .populate("followers","_id name")
    .exec((err,user)=>{
        if(err){
            res.status(422).json({error:err})
        }else{
            Post.find({author:req.body.userId})
            .populate("author","_id name")
            .exec((err,post)=>{
                 if(err){
                     return res.status(423).json({error:err})
                 }
                User.findByIdAndUpdate(req.user._id,{
                    $pull:{following:req.body.userId}
                },{
                    new:true
                }).exec((err,following)=>{
                    if(err){
                        res.status(422).json({error:err})
                    }else{
                        res.json({user,post,message:"now you are unfollowing"});
                    }
                })
        })
        }
    })
})

module.exports=router;