exports.regNumber = new RegExp(/^[0-9]*$/)
exports.regName = RegExp(/^[a-z A-Z-.']+$/)
exports.regAlpha = RegExp(/^[a-z A-Z]+$/)
exports.regAlphaNum = RegExp(/^[a-z A-Z. 0-9',-]+$/)
exports.regEmail = RegExp(/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i)
exports.regCard = RegExp(/^[0-9.]*$/)
exports.regUrl = RegExp(
  /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/
)
exports.regPhone = RegExp(/^[0-9 \s]{10}$/)
exports.regIndiaPhone = RegExp(/^[0]?[6789]\d{9}$/)
exports.regnotnumeric = RegExp(
  /^[a-z A-Z !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
)
exports.regJoinDate = RegExp(
  /^(0[1-9]|[12][0-9]|3[01])[\- \/.](?:(0[1-9]|1[012])[\- \/.](19|20)[0-9]{2})$/
)
exports.regHour = RegExp(/^\d{1,2}[:][0-5][0-9]$/)
exports.regPin = RegExp(/^[1-9]\d{5}$/)
exports.regPassword = RegExp(
  /^(?!.*[\s])(?=.*[A-Za-z])(?!.*[\s])(?=.*[0-9])(?!.*[\s]).{6,21}$/
)
