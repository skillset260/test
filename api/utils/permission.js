exports.isSuperAdmin = (user) =>
  user.userType === userEnum.superAdmin;