const { object } = require("joi");

//token types
const tokenEnum = Object.freeze({ login: "LOGIN", otpverify: "OTP_VERIFY" });

//file types
const allFileEnum = Object.freeze({
  image: "IMAGE",
  document: "DOCUMENT",
  video: "VIDEO",
});

//user types
const userEnum = Object.freeze({
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
});

//gender types
const genderEnum = Object.freeze({
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
});

//lo0gin types
const loginTypeEnum = {
  EMAIL: "email", // normal email/password login
  GOOGLE: "google", // Google SSO
  FACEBOOK: "facebook", // Facebook SSO
  APPLE: "apple", // Apple SSO
  ANDROID: "android", // Android native login
};

//export enums
module.exports = {
  tokenEnum,
  allFileEnum,
  userEnum,
  genderEnum,
  loginTypeEnum,
};
