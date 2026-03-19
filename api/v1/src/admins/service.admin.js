const Admin = require("./schema.admin")
const { combineObjects } = require("../../helper/utils")

//-------------------------------------------
/**
 * Get One Admin by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Admin>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Admin.findOne({ [fieldName]: fieldValue, isDeleted: false })
}

//-------------------------------------------

/**
 * Get One Admin by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Admin>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Admin.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * Create Admin
 * @param {object} bodyData
 * @returns {Promise<Admin>}
 */
const createNewData = async (bodyData) => {
  return Admin.create({ ...bodyData })
}
//-------------------------------------------

/**
 * get by id Admin
 * @param {ObjectId} id
 * @returns {Promise<Admin>}
 */
const getById = async (id) => {
  return Admin.findById(id)
}
//-------------------------------------------

/**
 * Update Admin by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Admin>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Admin.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Admin>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Admin.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Admin>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Admin.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Admin>}
 */
const getByIdAndDelete = async (id) => {
  return Admin.findByIdAndDelete(id)
}

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Admin>}
 */
const getOneAndDelete = async (matchObj) => {
  return Admin.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  )
}

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Admin>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Admin.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<Admin>}
 */
const findAll = async () => {
  return Admin.find()
}

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Admin>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Admin.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Admin>}
 */
const createMany = async (insertDataArray) => {
  return Admin.insertMany(insertDataArray)
}
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Admin>}
 */
const findCount = async (matchObj) => {
  return Admin.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<Admin>}
 */
const updateMany = async (matchObj, updateObject) => {
  return Admin.updateMany(
    { ...matchObj, isDeleted: false },
    { ...updateObject },
    { multi: true, upsert: false }
  )
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Admin>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds }
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      }
    }
    return { exists: false, existsSummary: "" }
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds) {
        element["_id"] = { $nin: exceptIds }
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] }
      }
      return { exists: false, fieldName: Object.keys(element)[0] }
    })
  )

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `
      }
      return acc
    },
    { exists: false, existsSummary: "" }
  )
}

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
}
