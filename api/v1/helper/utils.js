const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const redisClient = require("../../../database/redis");

exports.combineObjects = (objectsArray) => {
  let arra = objectsArray.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
  return arra;
};

exports.getQuery = (defaultQuery, reqQuery = false) => {
  if (defaultQuery && reqQuery && Object.keys(reqQuery)) {
    return Object.keys(reqQuery).reduce((acc, key) => {
      acc[key] = reqQuery[key];
      return acc;
    }, defaultQuery);
  }
  return defaultQuery;
};

exports.getFieldsToDisplay = (moduleName, userRoleData, actionName) => {
  let moduleData = userRoleData?.module?.find(
    (module) => module?.moduleName === moduleName
  );
  let actionDetails = moduleData?.moduleAction?.find(
    (m) => m?.actionName === actionName
  );
  let fields = actionDetails?.fields?.map((f) => {
    return f?.fieldValue;
  });
  if (fields?.length) {
    fields.push("_id");
  }
  return fields;
};

exports.getUserRoleData = async (req, service) => {
  let token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, config.jwt_secret);
  let userId = decoded?.Id;
  let userRoleId = decoded?.userRole;

  let matchQueryUser = { isDeleted: false, userId: userId };
  let matchQueryUserRole = { isDeleted: false, userRoleId: userRoleId };
  let dataExistWithUserId = await service.findAllWithQuery(matchQueryUser);
  let dataExistWithUserRole = await service.findAllWithQuery(
    matchQueryUserRole
  );

  return dataExistWithUserId.length
    ? dataExistWithUserId[0]
    : dataExistWithUserRole[0];
};

exports.getAllowedField = (allowedFields, result) => {
  if (allowedFields?.length) {
    let filteredResult = result?.map((item) => {
      let filteredItem = {};
      allowedFields?.forEach((field) => {
        filteredItem[field] = item[field];
      });
      return filteredItem;
    });

    return filteredResult;
  } else {
    return result;
  }
};

exports.generateRandomPassword = () => {
  const length = 8;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
};

exports.logOut = async (req, logOutAll = false) => {
  let token = req.headers["x-access-token"];
  let deviceId = req.headers["device-id"] ? req.headers["device-id"] : "";
  const decoded = await jwt.verify(token, config.jwt_secret_access);
  if (deviceId !== "" && logOutAll === false) {
    await redisClient.del(decoded.Id + deviceId);
  } else {
    const tokenKey = `${decoded.Id}*`;

    const allRedisValue = await redisClient.keys(tokenKey);

    const deletePromises = allRedisValue.map(
      async (key) => await redisClient.del(key)
    );
    await Promise.all(deletePromises);
  }
};

exports.logOutFromApp = async (req, logOutAll = false) => {
  let token = req.headers["x-access-token"];
  let deviceId = req.headers["device-id"] ? req.headers["device-id"] : "";
  const decoded = await jwt.verify(token, config.jwt_secret);
  if (deviceId !== "" && logOutAll === false) {
    await redisClient.del(decoded.Id + deviceId);
  } else {
    const tokenKey = `${decoded.Id}*`;
    const allRedisValue = await redisClient.keys(tokenKey);
    const deletePromises = allRedisValue.map(
      async (key) => await redisClient.del(key)
    );
    await Promise.all(deletePromises);
  }
};

exports.generateUniqueId = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};
