var express=require("express");
var router=express.Router();
var mongoose=require("mongoose");
var Post=mongoose.model("postcreate")
var requireLogin=require("../middleware/requireLogin");
router.get("/allPosts",(req,res)=>{
    Post.find()
        .populate("comments.commentator","_id name email")
        .populate("author","_id email name photoId")
        .then(posts=>{
            res.json({posts});
        })
        .catch(err=>{
            console.log(err);
        })
})
router.get("/myPosts",requireLogin,(req,res)=>{
     //console.log(req.user);
   // res.send("OK");
    Post.find({author:req.user._id})
        .populate("author","_id email name")
        .then(myposts=>{
            res.json({myposts});
        })
        .catch(err=>{
            console.log(err);
        })
})
router.post("/Createpost",(req,res)=>{
    const {title,caption,pic,user}=req.body;
    if(!title||!caption||!pic){
        return res.status(422).json({err:"Please Add All the fields."});
    }
    //console.log(req.user);
    //res.send("OK");
    //req.user.password=undefined
    console.log(user);
    const post=new Post({
        title,
        caption,
        image:pic,
        author:user
    });
    post.save()
        .then(result=>{
            res.json({post:result})
        })
        .catch(err=>{
            console.log(err);
        })
})
router.put("/like",requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .populate("author","_id name photoId")
    .exec((err,result)=>{
        if(err){
            res.status(422).json({error:err})
        }else{
            res.json(result);
        }
    })
})
router.put("/unLike",requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate("author","_id name photoId")
    .exec((err,result)=>{
        if(err){
            res.status(422).json({error:err})
        }else{
            res.json(result);
        }
    })
})
router.put("/comment",requireLogin,(req,res)=>{
    const {postId,commentator,opinion}=req.body;
    Post.findByIdAndUpdate(postId,{
        $push:{comments:{commentator:commentator,opinion:opinion}}
    },{
        new:true
    })
    .populate("comments.commentator","_id name email")
    .populate("author","_id name email photoId")
    .exec((err,result)=>{
        if(err){
            res.status(422).json({error:err})
        }else{
            res.json(result);
        }
    })
})
router.delete("/deletePost/:postId",requireLogin,(req,res)=>{
    console.log(req.params.postId);
    Post.findOne({_id:req.params.postId})
    .populate("author","_id")
    .exec((err,post)=>{
        console.log(post);
        console.log(req.user._id);
        if(err || !post){
            res.status(423).json({error:err})
        }
       if(post.author._id.toString()===req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            })
            .catch(err=>{
                console.log(err);
            })
        }
    })
})
module.exports=router;