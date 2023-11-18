const otpGenerator = require('otp-generator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.filterUserBody = (data) => {
    const keys = ["email", "name", "username", "password", "gender"];
    let user;
    keys.forEach((el)=>{
        for(let key in data){
            if(el === key){
                const newUser = {...user, [key]:data[key]}
                user = newUser;
            }
        }
    })
    return user
}

exports.generateOTP = () => {
    const otp = otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false });
    return otp
}

exports.hashData = async (data) => {
    const hash = await bcrypt.hash(data, 12);
    return hash;
}

exports.otpExpiryTime = () => {
    return new Date().getTime() + 10*60*1000;
}

exports.generateJwtToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_SECRET);
    return token;
}

exports.compareData = async (data, hashedData) => {
    const res =  await bcrypt.compare(data, hashedData);
    return res;
}