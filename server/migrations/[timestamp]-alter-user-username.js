'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // comments 테이블의 username 컬럼을 참조하는 외래 키 제약 조건 이름들을 조회
    const [commentConstraintResults] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = 'book_reviews'
         AND TABLE_NAME = 'comments'
         AND COLUMN_NAME = 'username'
         AND REFERENCED_TABLE_NAME = 'users'`
    );

    // comments 테이블의 username 컬럼을 참조하는 모든 외래 키 제약 조건 삭제
    for (const result of commentConstraintResults) {
      const constraintName = result.CONSTRAINT_NAME;
      await queryInterface.removeConstraint('comments', constraintName);
    }

    // users 테이블의 username 컬럼 타입 변경 및 NOT NULL 제약 조건 제거
    await queryInterface.changeColumn('users', 'username', {
      type: DataTypes.STRING(45),
      allowNull: true, // NULL 허용
    });

    // comments 테이블에 삭제했던 외래 키 제약 조건 다시 추가
    for (const result of commentConstraintResults) {
      const constraintName = result.CONSTRAINT_NAME;
      await queryInterface.addConstraint('comments', {
        fields: ['username'],
        type: 'foreign key',
        name: constraintName,
        references: {
          table: 'users',
          field: 'username',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // comments 테이블의 username 컬럼을 참조하는 외래 키 제약 조건 이름들을 조회
    const [commentConstraintResults] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = 'book_reviews'
         AND TABLE_NAME = 'comments'
         AND COLUMN_NAME = 'username'
         AND REFERENCED_TABLE_NAME = 'users'`
    );

    // comments 테이블의 username 컬럼을 참조하는 모든 외래 키 제약 조건 삭제
    for (const result of commentConstraintResults) {
      const constraintName = result.CONSTRAINT_NAME;
      await queryInterface.removeConstraint('comments', constraintName);
    }

    // users 테이블의 username 컬럼 타입 이전 상태로 롤백 및 NOT NULL 제약 조건 추가
    await queryInterface.changeColumn('users', 'username', {
      type: DataTypes.STRING(255),
      allowNull: false, // NOT NULL 제약 조건 추가
    });

    // comments 테이블에 삭제했던 외래 키 제약 조건 다시 추가 (이전 상태로 롤백)
    for (const result of commentConstraintResults) {
      const constraintName = result.CONSTRAINT_NAME;
      await queryInterface.addConstraint('comments', {
        fields: ['username'],
        type: 'foreign key',
        name: constraintName,
        references: {
          table: 'users',
          field: 'username',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  },
};