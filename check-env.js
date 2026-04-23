import dotenv from 'dotenv';
dotenv.config({ path: '/opt/enovait/api/.env' });
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'MISSING');
console.log('GROQ_MODEL:', process.env.GROQ_MODEL || 'not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'MISSING');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || 'not set');
