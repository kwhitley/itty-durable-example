module.exports = {
  roots: ['<rootDir>/test', '<rootDir>/functions'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '^.*.spec.(t|j)sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
