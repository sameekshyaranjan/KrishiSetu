/**
 * A reusable pagination utility for Mongoose models.
 *
 * @param {Object} model - The Mongoose model to query
 * @param {Object} query - The filter/search query object
 * @param {Number} page - The current page number (1-indexed)
 * @param {Number} limit - The number of items per page
 * @param {String|Object} populateFields - Fields to populate (optional)
 * @param {Object} sortOptions - Sorting options (default: newest first)
 * @returns {Object} - Standardized paginated response
 */
const paginate = async (model, query = {}, page = 1, limit = 10, populateFields = null, sortOptions = { createdAt: -1 }) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  let queryBuilder = model.find(query).skip(skip).limit(parsedLimit).sort(sortOptions);

  if (populateFields) {
    queryBuilder = queryBuilder.populate(populateFields);
  }

  const [data, total] = await Promise.all([
    queryBuilder,
    model.countDocuments(query)
  ]);

  return {
    success: true,
    count: data.length,
    total,
    page: parsedPage,
    pages: Math.ceil(total / parsedLimit),
    data
  };
};

module.exports = { paginate };
