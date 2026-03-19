const Profile = require("./schema.profile");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Profile by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Profile>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Profile.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Profile by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Profile>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Profile.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Profile
 * @param {object} bodyData
 * @returns {Promise<Profile>}
 */
const createNewData = async (bodyData) => {
  return Profile.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Profile
 * @param {ObjectId} id
 * @returns {Promise<Profile>}
 */
const getById = async (id) => {
  return Profile.findById(id);
};
//-------------------------------------------

/**
 * Update Profile by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Profile.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Profile.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Profile.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Profile>}
 */
const getByIdAndDelete = async (id) => {
  return Profile.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Profile>}
 */
const getOneAndDelete = async (matchObj) => {
  return Profile.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Profile>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Profile.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Profile>}
 */
const findAll = async () => {
  return Profile.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Profile>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Profile.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Profile>}
 */
const createMany = async (insertDataArray) => {
  return Profile.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Profile>}
 */
const findCount = async (matchObj) => {
  return Profile.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Profile>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Profile.updateMany(
    { ...matchObj, isDeleted: false },
    { ...updateObject },
    { multi: true, upsert: false },
  );
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Profile>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds };
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    }),
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" },
  );
};

//-------------------------------------------
module.exports = {
  getOneBySingleField,
  getOneByMultiField,
  createNewData,
  getById,
  getByIdAndUpdate,
  getOneAndUpdate,
  getByIdAndDelete,
  getOneAndDelete,
  aggregateQuery,
  findAllWithQuery,
  findAll,
  onlyUpdateOne,
  createMany,
  findCount,
  isExists,
  updateMany,
};
