const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const logger = require("../../../config/logger");
const authHelper = require("../helper/authenticationHelper");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const moment = require("moment");
const ApiError = require("../../../utilities/apiErrorUtils");
const { userEnum } = require("../../utils/enumUtils");
const { errorRes } = require("../../../utilities/resError");

/** admin */
exports.authCheckMiddleware = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */
    let url = req.url;
    let isTokenExist = authHelper.checkTokenExist(req, res);
    if (!isTokenExist || !isTokenExist.status) {
      console.log("ERROR-000");
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }

    let token = isTokenExist.data;
    const decoded = jwt.verify(token, config.jwt_secret_access);

    req.userData = decoded;
    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      console.log("ERROR-00");
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    if (req.userData.tokenType !== "LOGIN") {
      console.log("ERROR-01");
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    let userDetails = await authHelper.checkAdminValid(req.userData);
    if (!userDetails.status) {
      console.log("ERROR-02");
      throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
    }

    req.userData = {
      ...decoded,
      email: userDetails.data.email,
      mobile: userDetails.data.mobile,
    };

    // console.log(req.userData, "req.userData");
    if (url === "/logout") {
      const deviceIdCheck = authHelper.checkDeviceId(req, res);
      if (!deviceIdCheck.status) {
        console.log("ERROR 1");

        throw new ApiError(httpStatus.UNAUTHORIZED, deviceIdCheck.message);
      }

      if (deviceIdCheck.deviceId !== "") {
        const redisResponse = await authHelper.redisCheck(
          decoded,
          deviceIdCheck.deviceId,
          token,
        );
        if (!redisResponse.status) {
          console.log("ERROR 2");

          throw new ApiError(httpStatus.UNAUTHORIZED, redisResponse.message);
        }
      }
    }

    const redisResponse = await authHelper.redisAccesstknCheck(req);
    if (!redisResponse.status) {
      return res.status(401).send({
        message: redisResponse.message,
        code: redisResponse.code,
        issue: redisResponse.issue,
        data: redisResponse.data,
        status: redisResponse.status,
      });
    }

    next();
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};

/** otp verify */
exports.otpVerifyToken = async (req, res, next) => {
  try {
    let isTokenExist = authHelper.checkTokenExist(req, res);
    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }
    let token = isTokenExist.data;
    const decoded = await jwt.verify(token, config.jwt_secret_otp_verify);
    req.userData = decoded;

    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }
    if (req.userData.tokenType !== "OTP_VERIFY") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    if (req.userData.userType === userEnum.superAdmin) {
      let userDetails = await authHelper.checkAdminValid(req.userData);
      if (!userDetails.status) {
        throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
      }
    }

    next();
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};
