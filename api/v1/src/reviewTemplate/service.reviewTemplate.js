const profileService = require("../profile/service.profile");
const reviewFeatureService = require("../revieweFeature/service.revieweFeature");
const reviewFeatureOptionService = require("../reviewFeatureOption/service.reviewFeatureOption");
const seoKeywordService = require("../seoKeyword/service.seoKeyword");
const { default: mongoose } = require("mongoose");

/**
 * get random strings
 */
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * get employee details
 */
function getEmployeeContext(employees) {
  if (!employees || !employees.length) return null;

  const randomEmp = employees[Math.floor(Math.random() * employees.length)];

  const pronoun =
    randomEmp.gender === "male"
      ? "he"
      : randomEmp.gender === "female"
        ? "she"
        : "they";

  return {
    name: randomEmp.name,
    pronoun,
  };
}

/**
 * Generate Reviews
 */
function buildReviews(options, seoKeywords, employees) {
  const reviews = [];

  for (let i = 0; i < 4; i++) {
    const selectedOptions = getRandomItems(options, 5);
    let sentences = selectedOptions.map((opt) => opt.featureOption);

    // randomly 50% chance employee inject karega
    if (Math.random() > 0.5) {
      const emp = getEmployeeContext(employees);

      if (emp) {
        const empLine = `${emp.name} was very helpful and ${emp.pronoun} explained everything clearly`;

        // kisi bhi random position pe insert
        const insertIndex = Math.floor(Math.random() * sentences.length);
        sentences.splice(insertIndex, 0, empLine);
      }
    }

    // SEO keyword
    const randomKeyword =
      seoKeywords[Math.floor(Math.random() * seoKeywords.length)];

    const useAtStart = Math.random() > 0.5;

    let review;

    if (useAtStart) {
      review = `${randomKeyword}. ${sentences.join(". ")}.`;
    } else {
      review = `${sentences.join(". ")}. ${randomKeyword}.`;
    }

    reviews.push(review);
  }

  return reviews;
}

/**
 * Main Service Function
 */
exports.generateReviewTemplates = async (businessId, language) => {
  /**
   * get profile by business id
   */
  const profile = await profileService.getOneByMultiField({
    businessId: businessId,
  });

  if (!profile) {
    throw new Error("Business not found.");
  }

  /**
   * get features by categories and subcategories
   */
  const features = await reviewFeatureService.findAllWithQuery({
    categoryId: new mongoose.Types.ObjectId(profile.categoryId),
    subCategoryId: new mongoose.Types.ObjectId(profile.subCategoryId),
  });

  if (!features.length) {
    throw new Error("No features found for this business.");
  }

  /**
   * get feature options by feature id
   */
  const featureIds = features.map((f) => f._id);

  let options = await reviewFeatureOptionService.findAllWithQuery({
    reviewFeatureId: { $in: featureIds },
    ...(language && { language: language.toLowerCase() }),
  });

  if (!options.length && language) {
    options = await reviewFeatureOptionService.findAllWithQuery({
      reviewFeatureId: { $in: featureIds },
    });
  }

  /**
   * get seo keywords by categories and subcategories
   */
  const seoKeywordsData = await seoKeywordService.findAllWithQuery({
    categoryId: new mongoose.Types.ObjectId(profile.categoryId),
    subCategoryId: new mongoose.Types.ObjectId(profile.subCategoryId),
  });

  const seoKeywords = seoKeywordsData.map((k) => k.keyword);

  /**
   * generate reviews
   */
  const uniqueOptions = [...new Set(options.map((o) => o.featureOption))].map(
    (text) => options.find((o) => o.featureOption === text),
  );
  const reviews = buildReviews(uniqueOptions, seoKeywords, profile.employees);

  return {
    businessName: profile.businessDisplayName,
    googleBusinessLink: profile.googleBusinessLink,
    reviews,
  };
};
