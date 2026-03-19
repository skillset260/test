exports.generateOTP = async () => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let OTP = ""
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }
  return OTP
}

exports.generatePassword = async () => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let pass = ""
  for (let i = 0; i < 10; i++) {
    pass += digits[Math.floor(Math.random() * 10)]
  }
  return pass
}

exports.getabc = async (num) => {
  let extraA = parseInt(num / 26)
  let str = "A".repeat(extraA) || ""
  str += String.fromCharCode((num % 26) + 64)
  return str
}
