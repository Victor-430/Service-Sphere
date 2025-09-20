import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User";
import emailService from "../services/emailService";

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
// update user profile
// change password
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
    user:UserResponse,
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

export default authController;
