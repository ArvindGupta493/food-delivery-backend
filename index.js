const express = require("express")
const app = express()
const dotenv= require("dotenv")
const cors= require("cors")

dotenv.config()

const mongoose= require("mongoose")
mongoose.connect(`${process.env.MONGODB_URL}`).then(()=>{
    console.log("Database connected")
})

const userRouter= require("./Routes/userRoutes")
const cartRouter = require("./Routes/cartRoutes");

app.use("/api/cart", cartRouter);

app.use(cors())
app.use(express.json()) 
app.use("/api",userRouter)
 

app.get("/",(req,res)=>{ 
    res.send("hello Arvind") 
})  
 
app.listen(2000,()=>{
    console.log("server is live at port 2000") 
})


 
    