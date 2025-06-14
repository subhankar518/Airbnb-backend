import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

const signUp = asyncHandler( async (req, res) => {

        const {userName, email, fullName, phone, country, password}= req.body;
    
        if([userName, email, fullName, phone, country, password].some((fields)=>{
            return fields?.trim() === "";
        })){
            throw new ApiError(400, "All fields are required");
        }
    
        const existedUser = await User.find({
            $or: [{userName}, {email}, {phone}]
        })
    
        if(existedUser.length){
            throw new ApiError(409, "User with this username, email or phone already exist");
        }
    
        const userResponse= await User.create({
            fullName,
            email,
            userName: userName.toLowerCase(),
            password,
            phone,
            country,
        });

        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(userResponse);
    
        // this is for sercure cookie, only editable from server
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict", // need to check
        }

        const updatedUser = await User.findById(userResponse?._id).select("-password -refreshToken")

        return res.status(200)
              .cookie("accessToken", newAccessToken, options) // for seting tokens in browser
              .cookie("RefreshToken", newRefreshToken, options)
              .json(new ApiRespose(201,
                {
                    user: updatedUser, newAccessToken, newRefreshToken
                },
                "User Sign Up Successfully"
              ));
})

const generateAccessAndRefreshToken = async(user) => {
    try {
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken(); 

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false}); // for preventing of instant kickin of other field, Ex: password

        return { newAccessToken, newRefreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while genwrating refresh and access token");
    }
} 


export { signUp };