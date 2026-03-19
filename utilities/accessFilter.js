const { userEnum } = require("../api/utils/enumUtils");

const applyRoleFilter = (matchQuery, user) => {
    console.log("Applying role filter for user:", user);
  if (user.userType !== userEnum.superAdmin) {
    matchQuery.$and.push({
      createdBy: user._id,
    });
  }

  return matchQuery;
};

module.exports = { applyRoleFilter };