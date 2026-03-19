const config = require('../../../config/config')
const request = require('request')
var http = require('http')

//--------------------------------------------------

exports.smsCode = async function (smsData) {
  let resdata = {
    url: '',
    data: {},
    is_valid: false
  }
  let authkey = process.env.SMS_MASTER_KEY //# Your authentication key.
  let mobiles = smsData.mobile //# Multiple mobiles numbers separated by comma.
  let message = smsData.message //# Your message to send.
  let sender_id = process.env.SMS_SENDER_ID //# Sender ID, While using route4 sender id should be 6 characters long.
  // let route = process.env.SMS_ROUTE //# Define route
  let templetid = smsData.templetid

  // const url = process.env.SMS_URL_DEMO //# API URL
  const url = `https://dudusms.in/smsapi/send_sms?authkey=${authkey}&mobiles=${mobiles}&message=${message}&sender=${sender_id}&route=4&templetid=${templetid}`
  resdata = {
    url: url,
    is_valid: true
  }

  return resdata
}
//--------------------------------------------------

exports.sendSms = async function (url) {
  var dataToSend = {
    sendStatus: false,
    response: {},
    error: false
  }
  var result = await new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode === httpStatus.OK) {
        dataToSend = {
          sendStatus: true,
          response: response,
          error: false
        }
        resolve(dataToSend)
      } else {
        dataToSend = {
          sendStatus: false,
          response: {},
          error: true
        }
        reject(dataToSend)
      }
    })
  })
  return result
}

//--------------------------------------------------

exports.sendMsg91Function = async data => {
  var dataToSend = {
    sendStatus: false,
    response: null,
    error: false
  }
  /**
   * msg_api_key msg_sender_id msg_login_otp
   */
  const options = {
    method: 'POST',
    hostname: 'api.msg91.com',
    port: null,
    path: '/api/v5/flow/',
    headers: {
      authkey: config.msg_api_key,
      'content-type': 'application/JSON'
    }
  }

  const result = await new Promise(async function (resolve, reject) {
    const req = http.request(options, async function (res) {
      const chunks = []

      res.on('data', function (chunk) {
        chunks.push(chunk)
      })

      await res.on('end', function () {
        const body = Buffer.concat(chunks)
        let resBody = body.toString()

        resBody = JSON.parse(resBody)
        if (resBody.type === 'success') {
          dataToSend = {
            sendStatus: true,
            response: resBody,
            error: false
          }
          resolve(dataToSend)
        } else {
          dataToSend = {
            sendStatus: false,
            response: null,
            error: true
          }
          reject(dataToSend)
        }
      })
    })
    await req.write(JSON.stringify(data))
    await req.end()
  })
  return result
}
// { "flow_id": "EnterflowID",  "sender": "EnterSenderID",  "short_url": "1 (On) or 0 (Off)",  "mobiles": "919XXXXXXXXX",  "VAR1": "VALUE 1",  "VAR2": "VALUE 2"}
