import path from "path";
import dotenv from 'dotenv'

const PROJECT_ROOT_DIR = path.join(__dirname, '../..');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env.development.local') });
  dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env.development') });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env.production.local') });
  dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env.production') });
}
dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env.local') });
dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env') });

