const moment = require("moment");
const logger = require("../../../config/logger");

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id...');
  }
  return value;
};

const googleBusinessLink = (value, helpers) => {
  if (
    !value.match(
      /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|g\.page|goo\.gl)/,
    )
  ) {
    return helpers.message("Invalid Google Business link.");
  }
  return value;
};

const indianMobile = (value, helpers) => {
  if (!value.match(/^[6-9]\d{9}$/)) {
    return helpers.message('"{{#label}}" must be a valid mobile number.');
  }
  return value;
};
const objectIdCustom = (value, lable) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return { status: true, msg: `${lable} must be a valid mongo id` };
  }
  return { status: false, msg: "" };
};

const requiredCheckCustom = (value, lable) => {
  if (
    value === undefined ||
    value === "undefined" ||
    value === null ||
    value === "undefined"
  ) {
    return { status: true, msg: `${lable} is required.` };
  } else {
    let notValid = stringCheckCustom(value, lable);
    if (notValid.status) {
      return { status: notValid.status, msg: notValid.msg };
    } else {
      if (value.trim() === "") {
        return { status: true, msg: `${lable} is required.` };
      }
    }
  }
  return { status: false, msg: "" };
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number",
    );
  }
  return value;
};

const checkEmptyBody = (req) => {
  let errorMsg = [];

  if (Object.keys(req.body).length === 0) {
    errorMsg.push(
      "Some data is required to add or update. Empty request found. ",
    );
  }
  return errorMsg;
};

const checkValidKeys = (req, validKeys) => {
  let errorMsg = [];
  let bodyData = Object.keys(req.body);
  for (let key in bodyData) {
    if (validKeys.includes(bodyData[key]) === false) {
      errorMsg.push(`Invalid key ${bodyData[key]}. `);
    }
  }
  return errorMsg;
};

const emailFormat = (value, helpers) => {
  if (!value.match(/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i)) {
    return helpers.message("Email is invalid.");
  }
  return value;
};

const YYMMDDHHMMSS_fromat = (value, helpers) => {
  if (
    !value.match(
      /^(((\d\d)(([02468][048])|([13579][26]))-02-29)|(((\d\d)(\d\d)))-((((0\d)|(1[0-2]))-((0\d)|(1\d)|(2[0-8])))|((((0[13578])|(1[02]))-31)|(((0[1,3-9])|(1[0-2]))-(29|30)))))\s(([01]\d|2[0-3]):([0-5]\d):([0-5]\d))$/i,
    )
  ) {
    return helpers.message(
      'Invalid format for date time.It must be "YYYY-MM-DD HH:mm:ss".',
    );
  }
  return value;
};

const dateFormat = (value, helpers) => {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return helpers.message("Date fomate must be YYYY-MM-DD.");
  }
  return value;
};

const changeDateFormat = (value, helpers) => {
  return moment(value).utcOffset("+05:30").format("YYYY-MM-DD");
};
///^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i
const timeFormat = (value, helpers) => {
  if (!value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
    return helpers.message("Time fomate must be HH:MM AM/PM.");
  }
  return value;
};
const timeFormat24Hours = (value, helpers) => {
  if (!value.match(/^([01]\d|2[0-3]):?([0-5]\d)$/)) {
    return helpers.message("Time fomate must be of 24 hours.");
  }
  return value;
};
const HHMMSS_Format_check = (value, helpers) => {
  if (!value.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/)) {
    return helpers.message("Time fomate must be of HH:MM:SS.");
  }
  return value;
};

const parseStringfiedKeys = (req, validKeys) => {
  let errorMsg = [];
  for (let key in req.body) {
    if (validKeys.includes(key) && typeof req.body[key] === "string") {
      req.body[key] = JSON.parse(req.body[key]);
      // errorMsg.push(`Invalid key ${bodyData[key]}. `)
    }
  }
  return "";
};

const todayDateValid = (value, helpers) => {
  if (!moment(value) === moment().utcOffset("+05:30").format("YYYY-MM-DD")) {
    return helpers.message("Date must be Today.");
  }
  return value;
};

const DateTimeFormatValid = (value, helpers) => {
  //^([0-9]{4})-([0-1][0-9])-([0-3][0-9])\s([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9])$
  if (
    !value.match(
      /^([0-9]{4})-([0-1][0-9])-([0-3][0-9])\s([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9])$/,
    )
  ) {
    return helpers.message("Time format must be YYYY-MM-DD HH:mm:ss.");
  }
  return value;
};
const afterTodayValid = (value, helpers) => {
  // /moment(value).isAfter(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  if (
    !moment(value).isAfter(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  ) {
    return helpers.message(`Date must be after today's date.`);
  }
  return value;
};
const beforeTodayValid = (value, helpers) => {
  if (
    !moment(value).isBefore(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  ) {
    return helpers.message(`Date must be before today's date.`);
  }
  return value;
};
const sameOrAfterToday = (value, helpers) => {
  // /moment(value).isAfter(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  //moment(value).isSameOrAfter(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  if (
    !moment(value).isSameOrAfter(
      moment().utcOffset("+05:30").format("YYYY-MM-DD"),
    )
  ) {
    return helpers.message(`Date must be same or after today's date.`);
  }
  return value;
};

const sameorBeforeToday = (value, helpers) => {
  if (
    !moment(value).isBefore(moment().utcOffset("+05:30").format("YYYY-MM-DD"))
  ) {
    return helpers.message(`Date must be before today's date.`);
  }
  return value;
};

const isAfterCurrentTime = (value, helpers) => {
  //
  let currentDate = moment().format("YYYY-MM-DD");
  let currentTime = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
  var timeAndDate = moment(new Date(currentDate + " " + value)).format(
    "YYYY-MM-DD HH:mm:ss",
  );
  if (!moment(timeAndDate).isAfter(currentTime)) {
    return helpers.message(`Time must be after current time.`);
  }
  return value;
};
const dateTimeAfterCurrentTime = (value, helpers) => {
  //
  let currentTime = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
  if (!moment(value).isAfter(currentTime)) {
    return helpers.message(`Time must be after current time.`);
  }
  return value;
};

const checkYoutubeLink = (value, helpers) => {
  // http(?: s ?): \/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?
  if (!value.match(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/)) {
    return helpers.message("Youtube link is not valid.");
  }
  return value;
};

module.exports = {
  objectId,
  password,
  checkValidKeys,
  checkEmptyBody,
  emailFormat,
  objectIdCustom,
  requiredCheckCustom,
  dateFormat,
  timeFormat,
  timeFormat24Hours,
  YYMMDDHHMMSS_fromat,
  indianMobile,
  parseStringfiedKeys,
  sameOrAfterToday,
  todayDateValid,
  afterTodayValid,
  beforeTodayValid,
  sameorBeforeToday,
  isAfterCurrentTime,
  checkYoutubeLink,
  changeDateFormat,
  DateTimeFormatValid,
  dateTimeAfterCurrentTime,
  HHMMSS_Format_check,
  googleBusinessLink,
};
