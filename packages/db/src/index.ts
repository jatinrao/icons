export { createDb, type CreateDbOptions, type Db } from './client'
export { icons, type Icon, type NewIcon } from './schema'
export {
  listIcons,
  getIconByName,
  getIconById,
  createIcon,
  updateIcon,
  deleteIcon,
  upsertIconByName,
  DuplicateIconNameError,
  type IconInput,
} from './queries'
