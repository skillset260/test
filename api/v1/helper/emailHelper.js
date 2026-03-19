const nodemailer = require("nodemailer")
const config = require("../../../config/config")
const logger = require("../../../config/logger")
const { errorRes } = require("../../../utilities/resError")
const httpStatus = require("http-status")
const { default: mongoose } = require("mongoose")
const ApiError = require("../../../utilities/apiErrorUtils")

/***************/

/**
 *
 * @param {Object} transporter
 * @param {Object} mailOptions
 * @returns
 */
exports.sendEmailFunction = async (transporter, mailOptions) => {
  try {
    var dataToSend = {
      sendStatus: false,
      response: {},
      error: false,
    }

    var result = await new Promise(async (resolve, reject) => {
      var data = await transporter.sendMail(mailOptions, (error, info) => {
        if (!error && info.response.includes("250 Ok")) {
          dataToSend = {
            sendStatus: true,
            response: info.response,
            error: false,
          }
        } else if (error) {
          let errData = errorRes(error)
          logger.info(errData.resData)
          let { message } = errData.resData
          dataToSend = {
            sendStatus: false,
            response: message,
            error: true,
          }
        }

        resolve(dataToSend)
      })
    })

    if (result.sendStatus) {
      return {
        message: "Email sent",
        code: "OK",
        issue: null,
        data: result.response,
        status: true,
      }
    } else {
      return {
        message: "Email not sent",
        code: "ERR",
        issue: null,
        data: result.response,
        status: false,
      }
    }
  } catch (err) {
    console.log(err)
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message } = errData.resData
    return {
      message: message,
      code: "ERR",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    }
  }
}

exports.createTransporter = async () => {
  try {
    let transporter = await nodemailer.createTransport({
      host: config.smtp_mail_host,
      port: 25,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtp_mail_user, // generated ethereal user
        pass: config.smtp_mail_password, // generated ethereal password
      },
      debug: true, // show debug output
      ////logger: true, // log information in ////
    })
    if (transporter) {
      return {
        message: "transporter created",
        code: "OK",
        issue: null,
        data: transporter,
        status: true,
      }
    } else {
      return {
        message: "Something went wrong.",
        code: "ERR",
        issue: null,
        data: null,
        status: false,
      }
    }
  } catch (err) {
    console.log(err)
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message } = errData.resData
    return {
      message: message,
      code: "ERR",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    }
  }
}
exports.createMailOptions = async (emailData) => {
  try {
    let { emailSubject, emailBody, sendTo, sendFrom, attachments } = emailData

    var mailOptions = {
      from: sendFrom,
      to: sendTo,
      subject: emailSubject,
      html: emailBody,
      attachments: attachments,
    }
    if (mailOptions) {
      return {
        message: "mailOptions created",
        code: "OK",
        issue: null,
        data: mailOptions,
        status: true,
      }
    } else {
      return {
        message: "Something went wrong.",
        code: "ERR",
        issue: null,
        data: null,
        status: false,
      }
    }
  } catch (err) {
    console.log(err)
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message } = errData.resData
    return {
      message: message,
      code: "ERR",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    }
  }
}
