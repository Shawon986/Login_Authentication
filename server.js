const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { access } = require("fs")
const app = express()
app.use(bodyParser.json())

//! MongoDb connection
const uri = process.env.DB_URI
mongoose.connect(uri,{useNewUrlParser:true})
.then(()=>{
    console.log("DB is connected")
}) 
.catch((error)=>{
    console.error("DB is not connected")
})

//! Schema
const VisitorSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    }
})

//! Model
const Visitors = mongoose.model("Visitor",VisitorSchema)

//! Connection Check
app.get("/",(req,res)=>{
    res.json({message:"Welcome to Login Authentication app"})
})

//! Create Visitor
app.post("/visitors",async(req,res)=>{
    try {
        const salt =await bcrypt.genSalt(10)
        const hashedPass =await bcrypt.hash(req.body.password,salt)
        const password = hashedPass
        const visitorObject ={
            name:req.body.name,
            email:req.body.email,
            password:password
        }
        const visitor = new Visitors(visitorObject)
        res.status(201).json(visitor)
        await visitor.save()
    } catch (error) {
        console.error(error)
        res.status(400).json({message:"Something went wrong with the server !!!"})
    }
    

})

//Login a visitor

app.post("/visitors/login",async(req,res)=>{
    try {
        const {email,password}=req.body
    const visitor =await Visitors.findOne({email:email})
    if(!visitor){
        res.status(404).json({message:"Visitor  not found"})
    }else{
        const passvalidity = await bcrypt.compare(password,visitor.password)
        if(!passvalidity){
            res.status(401).json({message:"Visitor unauthorized"})
        }else{
            const accessToken = jwt.sign({email:visitor.email,id:visitor._id},process.env.JWT_SECRET)
            visitorObject= visitor.toJSON()
            visitorObject.accessToken = accessToken
            res.json(visitorObject)
        }
    }
    } catch (error) {
        console.error(error)
        res.status(400).json({message:"Something went wrong with the server !!!"})
    }
    
})

//Middleware
const authAccessToken = (req,res,next)=>{
    const authHeader = req.headers.authorization
    const accessToken = authHeader && authHeader.split(" ")[1]
    if(!accessToken){
        res.status(401).json({message:"Visitor unauthorized"})
        return
    }else{
        jwt.verify(accessToken,process.env.JWT_SECRET,(err,payload)=>{
            if(err){
                res.status(401).json({message:"Visitor unauthorized"})
                
            }else{
                req.payload=payload
                next()
            }
        })
    }
    
}

//! Get a visitor profile
app.get("/visitors/profile",authAccessToken,async(req,res)=>{
    try {
        const id = req.payload.id
        const visitor = await Visitors.findById(id)
        if(!visitor){
        res.status(404).json({message:"Visitor  not found"})
        }else{
            res.json(visitor)
        }
    } catch (error) {
        console.error(error)
        res.status(400).json({message:"Something went wrong with the server !!!"})
    }
})
 

 
//! Get all visitors
app.get("/visitors",async(req,res)=>{
    try {
        const visitor = await Visitors.find()
        res.json(visitor)
    } catch (error) {
        console.error(error)
        res.status(400).json({message:"Something went wrong with the server !!!"})
    }
})

//! Get a visitor by id
app.get("/visitors/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const visitor = await Visitors.findById(id)
        if(!visitor){
            res.status(404).json({message:"Visitor not found"})
        }else{
            res.json(visitor)
        }
    } catch (error) {
        console.error(error)
        res.status(400).json({message:"Something went wrong with the server !!!"})
    }
})

//! Update a visitor by id
app.put("/visitors/:id",async(req,res)=>{
    try {
        const salt =await bcrypt.genSalt(10)
        const hashedPass =await bcrypt.hash(req.body.password,salt)
        const id = req.params.id
        const visitor = await Visitors.findByIdAndUpdate(id,req.body,{new:true})
        if(!visitor){
            res.status(404).json({message:"Visitor not found"})
        }else{
            visitor.password= hashedPass
            res.json(visitor)
            await visitor.save()
        }
    } catch (error) {
        
    }
})

//! Delete a visitor by id
app.delete("/visitors/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const visitor = await Visitors.findByIdAndDelete(id)
        if(!visitor){
            res.status(404).json({message:"Visitor not found"})
        }else{
            res.json(visitor)
        }
    } catch (error) {
        
    }
})


const port = process.env.PORT 
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
})