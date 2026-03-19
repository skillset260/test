const moment = require("moment")
const { uploadFile2S3 } = require("../middleware/s3UploadImage")
const { promises: Fs } = require("fs")
const path = require("path")
const {
  documentMimeType,
  imageMimetype,
  videoMimetype,
  allMimetype,
} = require("../middleware/mimetypes")
const config = require("../../../config/config")
const logger = require("../../../config/logger")
const { allFileEnum } = require("../../utils/enumUtils")

/**
 *
 * @param {<fileData> }
 * file data is req.file data
 * @param {<fieldName>}
 * ex: image or title
 * field name is the name of unique field of the document against which file is being upload
 * @param {<routeData>}
 * route is to define which module ex user or file-manager
 * @param {<fileType>}
 * filetype: ex image or video
 * @returns
 */
const uploadFileFunction = async (fileData, fieldName, routeData, fileType) => {
  try {
    let isUploaded = false
    let fileUrl = ""
    let path_array = fileData.path.split(".")
    let file_name = `${fieldName}_${fileData.fieldname}${moment(new Date())
      .utcOffset("+05:30")
      .format("YMMDDHHmmss")}.${
      path_array[path_array.length - 1]
    }`.toLowerCase()
    let result = await uploadFile2S3(
      fileData.path,
      `${config.project}/${routeData}/${fileType}/${file_name}`.toLowerCase(),
      path_array[path_array.length - 1]
    )

    fileUrl = result
    isUploaded = fileUrl !== "" ? true : false

    if (result) {
      try {
        let unlinked = await Fs.unlink(fileData.path)
      } catch (e) {
        logger.info("Could'nt unlink file.")
        //TODO: find if file is removed or not.
      }
    }
    return {
      isUploaded: isUploaded,
      fileUrl: fileUrl,
    }
  } catch (err) {
    logger.info(err)
    return {
      isUploaded: false,
      fileUrl: "",
    }
  }
}

exports.uploadFileHelper = async (
  req,
  routeData,
  fieldName,
  fileType,
  errorFiles
) => {
  try {
    var fileObject = {}
    var isError = true
    var errMsg = "Some thing went wrong"
    let mimeTypeToCheck
    if (fileType === allFileEnum.image) {
      mimeTypeToCheck = imageMimetype
    } else if (fileType === allFileEnum.video) {
      mimeTypeToCheck = videoMimetype
    } else if (fileType === allFileEnum.document) {
      mimeTypeToCheck = documentMimeType
    } else {
      mimeTypeToCheck = allMimetype
    }

    if (
      req.files !== null &&
      req.files !== undefined &&
      errorFiles.length === 0
    ) {
      for (let field in req.files) {
        if (Array.isArray(req.files[field])) {
          if (req.files[field].length) {
            for (let each in req.files[field]) {
              let fileData = req.files[field][each]
              if (!mimeTypeToCheck.includes(fileData.mimetype)) {
                let unlinked = await Fs.unlink(fileData.path)
                isError = true
                errMsg = `File extension for ${fileData.fieldname} is not valid.Only ${fileType} are allowed.`
              } else {
                let fileUploadedData = await uploadFileFunction(
                  fileData,
                  fieldName,
                  routeData,
                  fileType
                )
                if (fileUploadedData.isUploaded) {
                  isError = false
                  errMsg = ""
                  // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                  if (fileObject.hasOwnProperty([fileData.fieldname])) {
                    if (typeof fileObject[fileData.fieldname] === "string") {
                      fileObject[fileData.fieldname] =
                        fileObject[fileData.fieldname].split(",")
                      fileObject[fileData.fieldname].push(
                        fileUploadedData.fileUrl
                      )
                    }
                  } else {
                    fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                  }
                  // fileObject[fileData.fieldname] = fileObject.hasOwnProperty([fileData.fieldname]) ? fileObject[fileData.fieldname].split(',').push(fileUploadedData.fileUrl) : fileUploadedData.fileUrl
                  // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                } else {
                  let unlinked = await Fs.unlink(fileData.path)
                  isError = true
                  errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                }
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
              let unlinked = await Fs.unlink(fileData.path)
              isError = true
              errMsg = `File extension for ${fileData.fieldname} is not valid.Only ${fileType} are allowed.`
            } else {
              let fileUploadedData = await uploadFileFunction(
                fileData,
                fieldName,
                routeData,
                fileType
              )
              if (fileUploadedData.isUploaded) {
                isError = false
                errMsg = ""
                // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                if (fileObject.hasOwnProperty([fileData.fieldname])) {
                  if (typeof fileObject[fileData.fieldname] === "string") {
                    fileObject[fileData.fieldname] =
                      fileObject[fileData.fieldname].split(",")
                    fileObject[fileData.fieldname].push(
                      fileUploadedData.fileUrl
                    )
                  }
                } else {
                  fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                }

                // req.body[fileData.fieldname] = fileUploadedData.fileUrl
              } else {
                let unlinked = await Fs.unlink(fileData.path)
                isError = true
                errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
              }
            }
          }
        }
      }
    }

    for (let each in fileObject) {
      req.body[each] = fileObject[each]
    }
    return { fileData: fileObject, errStatus: isError, errMsg: errMsg }
  } catch (err) {
    return { fileData: [], errStatus: true, errMsg: "" }
  }
}
