var express=require("express");
var mongoose=require("mongoose");
var bcrypt = require('bcrypt');
var jwt=require("jsonwebtoken");
var crypto=require("crypto");

var router=express.Router();
const User=mongoose.model("User");
const {JWT_SECRET}=require("../key");
const requireLogin=require("../middleware/requireLogin");

const nodemailer=require("nodemailer");
const sendgridTransport=require("nodemailer-sendgrid-transport");
const Transporter=nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:"your sendgrid api key which is generated"
    }
}))

router.get("/",(req,res)=>{
    res.send("Hello from route auth hahaha");
});
router.get("/profile",requireLogin,(req,res)=>{
    User.find({_id:req.user._id})
    .then(me=>{
       
        res.json({me});
    })
    .catch(err=>{
        console.log(err);
    })
});
router.post("/signUp",(req,res)=>{
  console.log(req.body.email);
  const {email,name,username,password}=req.body;
  if(!email||!name || !username|| !password){
     return  res.status(413).json({error:'Please Add All the Fields..!!'});
  }
  //res.json({message:'Posted Successfully'});
  User.findOne({email:email})
  .then((PrevSave)=>{
      if(PrevSave){
        return  res.status(413).json({error:'This Email Already Exists !!'});
      }
      bcrypt.hash(password,12)
        .then((hashedPassword)=>{
            const user=new User({
                name,
                email,
                username,
                password:hashedPassword
            })
            user.save()
              .then(user=>{
                  res.json({message:"Saved Successfully"})
              })
              .catch(error=>{
                  console.log(error);
              })
            })
     
  })
  .catch(err=>{
      console.log(err);
  })
})
router.post("/SignIn",(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return  res.status(413).json({error:'Please Add Email & Password Both.!!'});
    }
    User.findOne({email:email})
        .then(foundUser=>{
            if(!foundUser){
                return  res.status(413).json({error:'Invalid Email or Password'});
            }
            bcrypt.compare(password,foundUser.password)
                .then(doMatch=>{
                    if(doMatch){
                        //res.json({message:"Sign In Successfully"});
                        const token=jwt.sign({_id:foundUser._id},JWT_SECRET);
                        const {_id,name,username,email}=foundUser;
                        res.json({token,user:{_id,name,username,email},message:"Sign In Successfully"});
                        console.log(email);
                        Transporter.sendMail({
                            to:email,
                            from:"amartyasarkar4@gmail.com",
                            subject:"Sign Up Success",
                            html:`<h2>Oswm ${email} is Successfully Sign In</h2>`
                        })
                    }else{
                        return  res.status(413).json({error:'Invalid Email or Password'});
                    }
                })
        })
        .catch(err=>{
            console.log(err);
        })
})
router.put("/updateProfile",requireLogin,(req,res)=>{
    console.log(req.user._id);
    const {file,email,name,username,website,bio,phoneNo,gender}=req.body;
    if(!email||!name || !username){
       return  res.status(413).json({error:'Please Add All the Fields..!!'});
    }
    //res.json({message:'Posted Successfully'});
    User.findOne({email:email})
    .then((PrevSave)=>{
        if(PrevSave){
          return  res.status(413).json({error:'This Email Already Exists !!'});
        }else{
            User.findByIdAndUpdate(req.user._id,{
                name,
                email,
                username,
                photoId:file,
                website,
                bio,
                phoneNo,
                gender
            })
            .then((updateResult)=>{
                res.json(updateResult)
                     
             })
        }
    })
})
router.post("/forgot-password",(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
        }
        const newResetPasswordToken=buffer.toString("hex");
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                res.status(422).json({error:"User don't exist with this email"})
            }
           // res.json({msg:"Found this User",newResetPasswordToken});
           user.resetPasswordToken=newResetPasswordToken
           user.expireToken=Date.now()+360000
           user.save().then((result)=>{
            Transporter.sendMail({
                to:user.email,
                from:"amartyasarkar4@gmail.com",
                subject:"Reset New Password",
                html:`<h2>To reset your Password <a href=http://localhost:3000/setNewPassword/${newResetPasswordToken}>click</a> here ,,expireToken=${user.expireToken}</h2>`
            })
            res.json({message:"We found you.Please check your mail",newResetPasswordToken,giveLine:"Please check your mail"});
           }).catch((err)=>{
               console.log(err);
           })
        })
    })
})
router.get("/identify/:passwordToken",(req,res)=>{
    console.log(req.params.passwordToken);
    const token=req.params.passwordToken;
    console.log(token);
    User.findOne({resetPasswordToken:token,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            res.status(533).json({error:"Try again session expired."});
        }
        res.json({email:user.email});
    }).catch(err=>{
        console.log(err);
    })
})
router.post("/setNewPassword/:passwordToken",(req,res)=>{
    const token=req.params.passwordToken;
    const {newPassword}=req.body;
    User.findOne({resetPasswordToken:token,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            res.status(533).json({error:"Try again session expired !!.."});
        }
        bcrypt.hash(newPassword,12).then((hashedPassword)=>{
            user.password=hashedPassword,
            user.resetPasswordToken=undefined,
            user.expireToken=undefined,
            user.save().then((savedUser)=>{
                res.json({message:"Password updated successfully."});
            })
         })
    }).catch(err=>{
        console.log(err);
    })
})

module.exports=router;
