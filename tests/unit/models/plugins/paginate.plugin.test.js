const setupTestDB = require('../../../utils/setupTestDB');
const { Project, Task } = require('../../../../src/models');

setupTestDB();

// Custom pagination function to mimic Mongoose paginate plugin
const paginate = async (model, options = {}) => {
  const { page = 1, limit = 10, where = {}, include = [] } = options;
  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    where,
    offset,
    limit,
    include,
    order: [['id', 'ASC']], // Ensure consistent ordering for testing
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

describe('paginate plugin behavior', () => {
  beforeEach(async () => {
    // Sync models to ensure a clean slate
    await Promise.all([Project.sync({ force: true }), Task.sync({ force: true })]);

    // Define associations
    Project.hasMany(Task, { foreignKey: 'projectId' });
    Task.belongsTo(Project, { foreignKey: 'projectId' });

    // Create test data
    const project = await Project.create({ name: 'Project One' });
    await Task.create({ name: 'Task One', projectId: project.id });
  });

  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const task = await Task.findOne({ where: { name: 'Task One' } });
      const taskPages = await paginate(Task, {
        where: { id: task.id },
        include: [{ model: Project, as: 'project' }],
      });

      expect(taskPages.results[0].project).toBeDefined();
      expect(taskPages.results[0].project.id).toBe(task.projectId);
    });

    test('should populate nested fields', async () => {
      const project = await Project.findOne({ where: { name: 'Project One' } });
      const task = await Task.findOne({ where: { name: 'Task One' } });
      const projectPages = await paginate(Project, {
        where: { id: project.id },
        include: [{ model: Task, as: 'tasks' }],
      });

      expect(projectPages.results[0].tasks).toHaveLength(1);
      expect(projectPages.results[0].tasks[0].id).toBe(task.id);
      expect(projectPages.results[0].tasks[0].projectId).toBe(project.id);
    });
  });
});
