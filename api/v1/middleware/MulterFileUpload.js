const multer = require("multer")
const path = require("path")
const fs = require("fs")
const uuid4 = require("uuid4") // for naming files with random characters
const {
  imageMimetype,
  videoMimetype,
  documentMimeType,
  allMimetype,
} = require("./mimetypes")
const { allFileEnum } = require("../../utils/enumUtils")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    req.body = JSON.parse(JSON.stringify(req.body))

    var folder_name = req.baseUrl.replace("/", "")

    const new_file_path = path.join(
      __dirname,
      "../../../",
      "public",
      "uploads",
      folder_name
    )

    if (!fs.existsSync(new_file_path)) {
      fs.mkdirSync(new_file_path, { recursive: true })
    }

    cb(null, new_file_path) // Make sure 'new_file_path' is a valid string path
  },
  filename: (req, file, cb) => {
    const uuid = uuid4()
    cb(null, file.fieldname + "-" + uuid + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  let { fileType } = req.body
  let fileData = file.mimetype
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

  if (!mimeTypeToCheck.includes(fileData)) {
    return cb(new Error(`Only ${fileType.toLowerCase()} files are allowed!`))
  }
  cb(null, true)
}
//image upload
exports.fileUpload = multer({
  storage: storage,
  // fileFilter: fileFilter,
  // limits: {
  //     fileSize: 1024 * 1024 * 5,
  // },
})

exports.removefile = function (req, res, next) {
  next()
}
