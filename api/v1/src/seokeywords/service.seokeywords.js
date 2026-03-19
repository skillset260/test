const ReviewFeature = require("./schema.seokeywords");
const httpStatus = require("http-status");

class ReviewFeatureService {
  /**
   * Get all ReviewFeatures with pagination, search, and filtering
   */
  async getAllReviewFeatures({ page = 1, limit = 10, search = "", isActive }) {
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (isActive !== undefined) filter.isActive = isActive;

    const [ReviewFeatures, total] = await Promise.all([
      ReviewFeature.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewFeature.countDocuments(filter),
    ]);

    return {
      ReviewFeatures,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a single ReviewFeature by ID
   */
  async getReviewFeatureById(id) {
    return await ReviewFeature.findById(id);
   
  }

  /**
   * Get a single ReviewFeature by ReviewFeature code
   */
  async getReviewFeatureByCode(ReviewFeatureCode) {
    const ReviewFeature = await ReviewFeature.findOne({
      ReviewFeatureCode: ReviewFeatureCode.toUpperCase(),
    }).lean();
    if (!ReviewFeature) throw { status: httpStatus.NOT_FOUND, message: "ReviewFeature not found" };
    return ReviewFeature;
  }
  /**
   * Update an existing ReviewFeature
   */
 async updateReviewFeature(id, data) {
    return await ReviewFeature.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete a ReviewFeature by ID
   */
  async deleteReviewFeature(id) {
    return await ReviewFeature.findByIdAndUpdate(id, { isActive: false });
  }

  async createReviewFeature(data) {
        const reviewFeatureData = await ReviewFeature.create(data);;
         return reviewFeatureData;
  }

}

module.exports = new ReviewFeatureService();
