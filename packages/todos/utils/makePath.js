export const makePath = (...targets) =>
  targets.filter(v => v !== undefined && v !== '').join('/').replace('//', '/')
