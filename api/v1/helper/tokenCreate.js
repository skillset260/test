const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const logger = require("../../../config/logger");
const { tokenEnum } = require("../../utils/enumUtils");

/**
 *
 * @param {Object} tokenData
 * @returns
 */
exports.verifyOtp = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      name: tokenData.name,
      userType: tokenData.userType,
      tokenType: tokenEnum.otpverify,
    },
    config.jwt_secret_otp_verify,
    {
      expiresIn: config.jwt_expires_otp_verify,
    },
  );
  return token;
};
exports.tokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      name: tokenData.name,
      userType: tokenData.userType,
      tokenType: tokenEnum.login,
    },
    config.jwt_secret_access,
    {
      expiresIn: config.jwt_expires_access,
    },
  );
  return token;
};
exports.refreshTokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      name: tokenData.name,
      userType: tokenData.userType,
      tokenType: tokenEnum.login,
    },
    config.jwt_secret_refresh,
    {
      expiresIn: config.jwt_expires_refresh,
    },
  );
  return token;
};
