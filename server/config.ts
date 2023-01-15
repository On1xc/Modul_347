import dotenv from 'dotenv';
dotenv.config({path: './.env'});

const { SERVER_PORT } = process.env
const ROUND_DURATION = 50
const ROUND_COUNT = 999
const DRAW_ROUND_CUTOFF = 5000

export {
  ROUND_DURATION,
  ROUND_COUNT,
  DRAW_ROUND_CUTOFF,
  SERVER_PORT,
}