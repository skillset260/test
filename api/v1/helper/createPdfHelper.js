require("dotenv").config()
const pdf = require("html-pdf")

//--------------------------------------------------

const pdfGenerate = async (body_data) => {
  try {
    const options = {
      format: "A3",
      border: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    }
    return new Promise((resolve, reject) => {
      const pdfInstance = pdf.create(body_data, options)
      pdfInstance.toBuffer(function (err, buffer) {
        if (err) {
          console.log("error while creating pdf buffer", err)
          resolve(false)
        } else {
          resolve(buffer)
        }
      })
    })
  } catch (err) {
    console.log(err, body_data)
    return false
  }
}

const getReceiptPdfUrl = async (receiptHtml) => {
  try {
    let pdf_Buffer = await pdfGenerate(receiptHtml)

    if (pdf_Buffer) {
      return {
        status: true,
        data: pdf_Buffer,
        messgae: "All Ok",
      }
    }

    return {
      status: false,
      data: null,
      messgae: "All Ok",
    }
  } catch (err) {
    console.log(err)
    return {
      status: false,
      data: null,
      messgae: "All Ok",
    }
  }
}
module.exports = {
  getReceiptPdfUrl,
  pdfGenerate,
}
