import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const adminUsernames = ['관리자', '책마을이장', '책마을지기'];
    const googleId = 'leeyoungwookis@gmail.com';

    for (const username of adminUsernames) {
      await queryInterface.bulkInsert('users', [{
        username,
        googleId,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['관리자', '책마을이장', '책마을지기']
    });
  }
}; 