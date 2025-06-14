import { connectDb } from "./db/connectDb.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path: './env'
})

const port= process.env.PORT || 8001

connectDb().then(()=>{
    app.on("error",(error)=> console.log("ERROR", error));
    app.listen(port, ()=> console.log(`Server is running on ${port}`))
}).catch((err)=>{
    console.log("MongoDB Connection Failed !!",err);
});

