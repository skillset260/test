const moment = require("moment")
const { uploadFileS3 } = require("./s3UploadMiddleware")
const { promises: Fs } = require("fs")
const {
  allMimetype,
  fileMimetype,
  documentMimeType,
  videoMimetype,
} = require("./mimetypes")
const config = require("../../../config/config")
const logger = require("../../../config/logger")
const { allFileEnum } = require("../../utils/enumUtils")

const uploadFileFunction = async (fileData, fieldName, routeData) => {
  try {
    let isUploaded = false
    let fileUrl = ""
    let path_array = fileData.path.split(".")
    let file_name = `${fieldName}_${fileData.fieldname}_${moment(new Date())
      .utcOffset("+05:30")
      .format("YMMDDHHmmss")}.${
      path_array[path_array.length - 1]
    }`.toLowerCase()
    let result = await uploadFileS3(
      fileData.path,
      `${config.project}/${routeData}/${file_name}`.toLowerCase(),
      path_array[path_array.length - 1]
    )

    fileUrl = result
    isUploaded = fileUrl !== "" ? true : false
    if (result) {
      try {
        let unlinked = await Fs.unlink(fileData.path)
      } catch (e) {
        //todo: to check file unlink worked. Do not remove console.
        logger.info("Could'nt unlink file.")
      }
    }
    return {
      isUploaded: isUploaded,
      fileUrl: fileUrl,
    }
  } catch (err) {
    return {
      isUploaded: false,
      fileUrl: "",
    }
  }
}

exports.uploadFile = async (fieldName) => {
  return async (req, res, next) => {
    try {
      if (
        req.files &&
        Object.keys(req.files).length !== null &&
        Object.keys(req.files).length !== 0
      ) {
        if (req.body.errorFiles === undefined) {
          req.body.errorFiles = []
        }
        let fileobject = {}
        let isError = true
        let errMsg = "No file found"
        if (fileType === allFileEnum.file) {
          mimeTypeToCheck = fileMimetype
        } else if (fileType === allFileEnum.video) {
          mimeTypeToCheck = videoMimetype
        } else if (fileType === allFileEnum.document) {
          mimeTypeToCheck = documentMimeType
        } else {
          mimeTypeToCheck = allMimetype
        }

        var folder_name = req.baseUrl.replace("/", "")
        let fileTitle = req.body[fieldName].replace(" ", "")
        if (
          Object.keys(req.files).length !== null &&
          Object.keys(req.files).length !== 0 &&
          req.body.errorFiles.length === 0
        ) {
          for (let field in req.files) {
            if (Array.isArray(req.files[field])) {
              if (req.files[field].length) {
                for (let each in req.files[field]) {
                  let fileData = req.files[field][each]
                  if (!mimeTypeToCheck.includes(fileData.mimetype)) {
                    isError = true
                    errMsg = `File extension for ${fieldName} is not valid. Only files are allowed.`
                  }

                  let fileUploadedData = await uploadFileFunction(
                    fileData,
                    fileTitle,
                    folder_name
                  )
                  if (fileUploadedData.isUploaded) {
                    isError = false
                    errMsg = ""
                    // fileobject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                    if (fileobject.hasOwnProperty([fileData.fieldname])) {
                      if (typeof fileobject[fileData.fieldname] === "string") {
                        fileobject[fileData.fieldname] =
                          fileobject[fileData.fieldname].split(",")
                        fileobject[fileData.fieldname].push(
                          fileUploadedData.fileUrl
                        )
                      }
                    } else {
                      fileobject[fileData.fieldname] = fileUploadedData.fileUrl
                    }
                    // fileobject[fileData.fieldname] = fileobject.hasOwnProperty([fileData.fieldname]) ? fileobject[fileData.fieldname].split(',').push(fileUploadedData.fileUrl) : fileUploadedData.fileUrl
                    // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                  } else {
                    isError = true
                    errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                  }
                }
              }
            } else {
              if (
                !Array.isArray(req.files[field]) &&
                typeof req.files[field] === "object"
              ) {
                let fileData = req.files[field]
                if (!mimeTypeToCheck.includes(fileData.mimetype)) {
                  isError = true
                  errMsg = `File extension for ${fileData.fieldname} is not valid. Only files are allowed.`
                }
                let fileUploadedData = await uploadFileFunction(
                  fileData,
                  fileTitle,
                  routeData
                )
                if (fileUploadedData.isUploaded) {
                  isError = false
                  errMsg = ""
                  // fileobject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                  if (fileobject.hasOwnProperty([fileData.fieldname])) {
                    if (typeof fileobject[fileData.fieldname] === "string") {
                      fileobject[fileData.fieldname] =
                        fileobject[fileData.fieldname].split(",")
                      fileobject[fileData.fieldname].push(
                        fileUploadedData.fileUrl
                      )
                    }
                  } else {
                    fileobject[fileData.fieldname] = fileUploadedData.fileUrl
                  }

                  // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                } else {
                  isError = true
                  errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                }
              }
            }
          }
          for (let each in fileobject) {
            req.body[each] = fileobject[each]
          }
        }

        if (isError) {
          return res.status(httpStatus.OK).send({
            message: errMsg,
            status: false,
          })
        }

        next()
      } else {
        next()
      }

      // return { fileData: fileobject, errStatus: isError, errMsg: errMsg }
    } catch (err) {
      return res.status(httpStatus.OK).send({
        message: `Something went wrong with the file ${fieldName}.`,
        status: false,
      })
      // return { fileData: [], errStatus: true, errMsg: "" }
    }
  }
}

// exports.uploadFileCall = ()
