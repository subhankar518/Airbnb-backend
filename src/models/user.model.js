import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema= new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        phone: {
            type: Number,
            required: true,
            unique: true
        },
        country: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

// pre hook of mongoose
userSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
})

// Custom methods for schema 
userSchema.methods.isPasswordCurrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}



export const User= mongoose.model("User", userSchema);