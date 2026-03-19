const Category = require("./schema.category");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Category by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Category>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Category.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One Category by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Category>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Category.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create Category
 * @param {object} bodyData
 * @returns {Promise<Category>}
 */
const createNewData = async (bodyData) => {
  return Category.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id Category
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getById = async (id) => {
  return Category.findById(id);
};
//-------------------------------------------

/**
 * Update Category by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Category.findByIdAndUpdate(
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
 * @returns {Promise<Category>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Category.findOneAndUpdate(
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
 * @returns {Promise<Category>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Category.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getByIdAndDelete = async (id) => {
  return Category.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Category>}
 */
const getOneAndDelete = async (matchObj) => {
  return Category.findOneAndUpdate(
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
 * @returns {Promise<Category>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Category.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Category>}
 */
const findAll = async () => {
  return Category.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Category>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Category.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Category>}
 */
const createMany = async (insertDataArray) => {
  return Category.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Category>}
 */
const findCount = async (matchObj) => {
  return Category.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Category>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Category.updateMany(
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
 * @returns {Promise<Category>}
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
