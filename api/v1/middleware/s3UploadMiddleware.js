// const moment = require('moment');
// const mongoose = require('mongoose')
// const { validationForValidatePeramiter, isValidDate, isValidDateTime } = require('./validationForValidateData');
const fs = require("fs")
const AWS = require("aws-sdk")
const config = require("../../../config/config")
const logger = require("../../../config/logger")

AWS.config.update({ region: config.aws_bucket_region })

const s3 = new AWS.S3({
  accessKeyId: config.aws_access_key,
  secretAccessKey: config.aws_secret_key,
})

// exports.getDiffrenceInMinutes = (greater_date, smaller_date) => {
//     var minute_result = moment.utc(moment(greater_date, "DD-MM-YYYY HH:mm:ss").diff(moment(smaller_date, "DD-MM-YYYY HH:mm:ss"))).format("mm")
//     return minute_result;
// }

exports.uploadFileS3 = async (path, name, type) => {
  let url = ""
  try {
    let file_data = fs.readFileSync(path)
    const params = {
      Bucket: config.aws_bucket_name, // pass your bucket name
      Key: name, // file will be saved as testBucket/contacts.csv
      Body: file_data,
      ContentType: `image/${type}`, // required. Notice the back ticks
      ACL: "public-read", // for make it public
    }

    try {
      const stored = await s3.upload(params).promise()

      url = stored.Location
    } catch (err) {}
  } catch (error) {}
  return url
}

exports.uploadFile2S3 = async (path, name, type) => {
  let url = ""
  try {
    let file_data = fs.readFileSync(path)
    const params = {
      Bucket: config.aws_bucket_name, // pass your bucket name
      Key: name, // file will be saved as testBucket/contacts.csv
      Body: file_data,
      ContentType: `file/${type}`, // required. Notice the back ticks
      ACL: "public-read", // for make it public
    }

    try {
      const stored = await s3.upload(params).promise()

      url = stored.Location
    } catch (err) {}
  } catch (error) {}
  return url
}

exports.deleteFileS3 = async (filename) => {
  let resData = false
  const params = {
    Bucket: config.aws_bucket_name, // pass your bucket name
    Key: filename,
  }
  try {
    const deleted = await s3.deleteObject(params).promise()

    if (deleted) {
      resData = true
    }
  } catch (err) {}
  return resData
}

exports.uploadBufferFileS3 = async (file_buffer, name, type, mimetype) => {
  let url = ""
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // pass your bucket name
      Key: name, // file will be saved as testBucket/contacts.csv
      Body: file_buffer,
      ContentType: `${mimetype}`, // required. Notice the back ticks
      // ContentType: `image/${type}`, // required. Notice the back ticks
      ContentDisposition: `inline`,
      ACL: "public-read", // for make it public
    }

    try {
      const stored = await s3.upload(params).promise()

      url = stored.Location
    } catch (err) {
      console.log(err, "err")
    }
  } catch (error) {
    console.log(error, "error")
  }
  return url
}
