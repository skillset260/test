const adminService = require("../src/admins/service.admin");
const logger = require("../../../config/logger");
const moment = require("moment");
const { errorRes } = require("../../../utilities/resError");
const httpStatus = require("http-status");
const redisClient = require("../../../database/redis");
const { default: mongoose } = require("mongoose");
const ApiError = require("../../../utilities/apiErrorUtils");

const checkTokenExist = (req, res) => {
  if (
    !req.headers ||
    !req.headers["x-access-token"] ||
    req.headers["x-access-token"] === ""
  ) {
    return {
      data: {
        message: "Authentication Failed. Please login.",
        code: "TOKEN_NOT_FOUND.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      },
      statusCode: httpStatus.UNAUTHORIZED,
      status: false,
    };
  } else {
    return {
      data: req.headers["x-access-token"].trim(),
      statusCode: httpStatus.OK,
      status: true,
    };
  }
};

const redisCheck = async (decoded, deviceId, token) => {
  try {
    const redisValue = await redisClient.get(decoded.Id + deviceId);
    if (!redisValue) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }
    const redisAccessToken = redisValue.split("***");
    if (token !== redisAccessToken[0]) {
      throw new ApiError(httpStatus.ok, "Invalid Token");
    }
    return {
      message: "Ok",
      data: redisAccessToken,
      status: true,
    };
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message } = errData.resData;
    return {
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    };
  }
};

const redisAccesstknCheck = async (req) => {
  try {
    //get token from redis database with requested userId
    let tokenKey = `${req.userData.Id}*`;
    const keys = await redisClient.KEYS(tokenKey);

    if (!keys || keys.length === 0) {
      return {
        message: "Authentication failed. Please login again.",
        code: "INVALID_TOKEN",
        issue: "AUTHENTICATION_FAILED",
        status: false,
        data: null,
      };
    }

    for (const key of keys) {
      let tokenValue = await redisClient.get(key);
      // match access token
      if (tokenValue && tokenValue.includes(req.headers["x-access-token"])) {
        return {
          message: "OK",
          code: "OK",
          issue: null,
          status: true,
          data: null,
        };
      }
    }

    return {
      message: "Authentication failed.",
      code: "INVALID_TOKEN",
      issue: "AUTHENTICATION_FAILED",
      status: false,
      data: null,
    };
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message } = errData.resData;
    return {
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    };
  }
};

const checkDeviceId = (req, res) => {
  if (
    req.route.path !== "/logout" &&
    (!req.headers ||
      !req.headers["device-id"] ||
      req.headers["device-id"] === "")
  ) {
    return {
      data: {
        message: "Invalid Device ID",
        code: "DEVICE_ID_NOT_FOUND.",
        issue: "INVALID_DEVICE_ID",
        data: null,
        status: false,
      },
      statusCode: httpStatus.UNAUTHORIZED,
      status: false,
    };
  } else {
    return {
      deviceId: req.headers["device-id"] ? req.headers["device-id"].trim() : "",
      statusCode: httpStatus.OK,
      status: true,
    };
  }
};

const checkAdminValid = async (userData) => {
  try {
    let { Id: userId } = userData;
    let userExist = await adminService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (!userExist) {
      return {
        message: "user not found.",
        code: "USER_NOT_FOUND.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      };
    } else {
      return {
        message: "All OK",
        data: userExist,
        code: "OK",
        issue: null,
        status: true,
      };
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return {
      message,
      status,
      data,
      code: "USER_NOT_FOUND.",
      issue: "AUTHENTICATION_FAILED",
    };
  }
};

module.exports = {
  checkTokenExist,
  redisCheck,
  checkDeviceId,
  checkAdminValid,
  redisAccesstknCheck,
};
