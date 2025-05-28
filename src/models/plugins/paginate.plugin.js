/* eslint-disable no-param-reassign */

/**
 * Sequelize pagination plugin
 * @param {Model} Model - Sequelize model
 */
const paginate = (Model) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Object[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of records
   */
  /**
   * Query for records with pagination
   * @param {Object} [filter] - Sequelize where filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple criteria separated by commas (,)
   * @param {string} [options.populate] - Associations to include. Multiple separated by commas (,)
   * @param {number} [options.limit=10] - Max records per page
   * @param {number} [options.page=1] - Current page
   * @returns {Promise<QueryResult>}
   */
  Model.paginate = async function (filter = {}, options = {}) {
    // Sort
    let order = [['createdAt', 'ASC']];
    if (options.sortBy) {
      order = options.sortBy.split(',').map((sortOption) => {
        const [key, orderDir] = sortOption.split(':');
        return [key.trim(), orderDir === 'desc' ? 'DESC' : 'ASC'];
      });
    }

    // Pagination
    const limit = options.limit && Number(options.limit) > 0 ? Number(options.limit) : 10;
    const page = options.page && Number(options.page) > 0 ? Number(options.page) : 1;
    const offset = (page - 1) * limit;

    // Include associations
    let include = [];
    if (options.populate) {
      include = options.populate.split(',').map((association) => association.trim());
    }

    // Query using findAndCountAll
    const { count: totalResults, rows } = await Model.findAndCountAll({
      where: filter,
      order,
      limit,
      offset,
      include,
    });

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: rows,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

module.exs = paginate;
