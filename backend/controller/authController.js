import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

// 1. generate jwt token
// 2. refresh jwt token
// 3. register user
// check if user already exist
// create new user
// email verification token
// send verification email
// generate access token
// remove password from response
// return response
// 4. login user
// check for validation error
// find user
// validate password
//  generate token
// remove password and emailtoken,passwordreset token from response
// return response
// 5. get user profile
// 6. update user profile
// 7. change password
// 8. forgot password
// verify email
// logout

// generate jwt token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

// register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        error: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      skills,
      certifications,
      bio,
      phone,
    } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || "client",
    };

    if(bio) userData.bio = bio
    if(phone) userData.phone = phone
    if(role === 'experts'  && skills) userData.skills = skills
    if( role === 'experts' && certifications) userData.certifications = certifications

    const user = new User(userData)

    // generate email verification code
    const emailToken = user.generateEmailVerificationToken()

    await user.save()

    // send verification email
    try {
      await emailService.sendVerificationEmail()
    } catch (error) {
      console.log('Email sending failed:', error)
    }

    // access token
    const token = generateToken(user._id)

    // remove password and token from response
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.emailVerificationToken

    res.status(201).json({
      message: "Registration successful",
      data: {
        user: userResponse,
        token,
        tokenType: "Bearer"

      }
    })

  } catch (error) {
    console.log('Registratio error:' , error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal serval error'
    })
  }
};

// login user 
const login = async (req, res) => {
try {
  // check for validation error
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.json({
      message: "validation error",
      errors: errors.array()
    })
  }

  const {email, password} = req.body

  // find user and include password for comparison
  const user = await User.findOne({email}).select('+password')

  if(!user || !user.isActive){
    return res.status(401).json({
      message: "Invalid email or password"
    })
  }

  // check password
  const isPasswordValid =  await user.comparePassword(password)
  if(!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password"
    })
  } 

  // update last login
  user.lastLoginAt() = new Date()
  await user.save()

  // Generate token
  const token = generateToken(user._id)

  // remove password from response
const userResponse = user.toObject()
delete userResponse.password
delete userResponse.passwordResetToken
delete userResponse.emailVerificationToken

res.status(200).json({
  message: 'Login Successful',
  data:{
    user:userResponse,
    token,
    tokenType: "Bearer"
  }
})


} catch (error) {
  console.error('Login error:', error)
  res.status(500).json({
    message:"Login failed",
    error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"  })
}
}

// get current user profile
const getProfile = async (req, res) => {
try{
  const user = await User.findById(req.user._id).select('-password')

  res.status(200).json({
data: {user}
  })
}catch(error){
console.error("Get profile error:", error)
res.status(500).json({
  message:"Failed to get user profile",

})
}
}

// update user profile 
const updateProfile = async (req, res) => {
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      res.status(400).json({
      message: 'Validation error',
      errors: errors.array()
    })

    }


const allowedUpdates = ['firstname', 'lastname', 'location', 'skills', 'phone', 'bio', 'certifications' ]
const updates ={}

const updatedField = allowedUpdates.forEach(field => {

  if(req.body[field] !== undefined){
    updates[field] = req.body[field]
  }

}
)

const user = await User.findByIdAndUpdate(req.user._id, updates, {new:true, runValidator: true}).select('-password')

if(!user){
  res.status(400).json({
    message: "User not found"
  })
}

res.status(200).json({
  message: "Profile updated successfully",
  data: {user}
})

}catch(error){
console.error('Profile update error:', error)
res.status(500).json({
  message: 'Failed to update profile'
})
  }
  
}

// change password
const changePassword = async (res, req) => {
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({
        message: 'validation error',
        errors: errors.array()
      })
    }
const {currentPassword, newPassword} = req.body

// get user with password
const user = await User.findById(req.user._id).select('+password')

//verify current password
const isCurrentPassword = await user.comparePassword(currentPassword)

if(!isCurrentPassword){
return res.status(400).json({
  message: "Current password is incorrect"
})
}

//update password
user.password = newPassword
await user.save()

res.status(200).json({
  message:"password changed successfully"
})


  }catch(error){
    console.log(`error changing password:`, error)
    res.status(500).json({"message":"failed to change password"})
  }
}

// forgot password
const forgotPassword = async (req, res) => {
  
  try{

const {email} = req.body
  // get user by email
  const user = await User.findOne(email)
  if(!user){
    return res.status(200).json({
      message:"A password reset link has been set to the an account with the email"
    })
  }
  const resetToken = User.generatePasswordRestToken()
   await user.save()

  //  send reset email
  try{
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken)
  
  }catch(error){
    console.log('password reset email failed:', error)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()


    return res.status(500).json({
      message:"Failed to process password reset email"
    })
  }

res.status(200).json({
  message:"Password reset link has been sent to your email"
})

   }catch(error){
    console.log("forgot password error:", error)
return res.status(500).json({
      message:"Failed to process password reset email"
    })
  }

}

// reset password
const resetPassword = async (req, res) => {
  try{
const {token, newPassword} = req.body

const user = await User.findOne({
  passwordRestToken: token,
passwordResetExpires:{$gt: Date.now()}

})

if(!user){
  return res.status(400).json({
    message:"Password reset token is invalid or has expired"
  })
}

// update password
user.password = newPassword
user.passwordResetExpires = undefined
user.passwordResetToken = undefined
await user.save()

res.status(200).json({
  message:"password reset successfully"
})

  }catch(error){console.log("passwrod reset errro:", error)
res.status(500).json({
  message:"Failed to reset password"
})

  }


}

// verify email
const verifyEmail = async (req, res) => {
try{


const {token} = req.params

const user = await User.findOne({emailVerificationToken: token})

if(!user){
  return res.status(400).json({
    message:"Invalid verification token"
  })
}

user.isVerified = true
user.emailVerifiedAt = new Date()
user.emailVerificationToken = undefined
await user.save()

res.status(200).json({
  message: "Email verified successful"
})

}catch(error){
  console.log("Email verification error:", error)
  res.status(500).json({
    message: "Failed to verify email"
  })

}
  
}

// logout

const logout = async (req, res) => {

  try{
    console.log(`User ${req.user._id} logged out at ${new Date()}`)
    res.status(200).json({
      message:"Logout successful"
    })
  }catch(error){
    console.log("logout error:", error)
    res.status(500).json({
      message: "Logout failed"
    })
  }
}


export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout, 
  generateRefreshToken

}
