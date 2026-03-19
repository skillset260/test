const errorRes = (err) => {
  let i = 1
  let error_msg = "Something went wrong."
  let statusCode =
    err.statusCode !== undefined && err.statusCode !== null
      ? err.statusCode
      : 500
  if (!err.message) {
    for (let key in err.errors) {
      if (err.errors[key].message) {
        error_msg += i + "." + err.errors[key].message
        i++
      }
    }
  } else {
    error_msg = err.message
  }

  return {
    statusCode: statusCode,
    resData: {
      message: error_msg,
      status: false,
      data: null,
      code: "ERR",
      issue: "SOME_ERROR",
    },
  }
}
module.exports = { errorRes }
