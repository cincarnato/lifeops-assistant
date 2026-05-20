const commonEnv = {
	NODE_ENV: 'production',
	HOST: '0.0.0.0',

	//IDENTITY
	DRAX_JWT_SECRET: '',
	DRAX_JWT_EXPIRATION: '24h',
	DRAX_JWT_ISSUER: 'DRAX',
	DRAX_APIKEY_SECRET: '',
	DRAX_DEFAULT_ROLE: 'Operator',

	//DB
	DRAX_DB_ENGINE: 'mongo', //sqlite or mongo
	DRAX_MONGO_URI: 'mongodb://127.0.0.1:27017/drax',
	DRAX_SQLITE_FILE: 'drax.db',

	//APP
	DRAX_PORT: '8080',
	DRAX_BASE_URL: 'http://localhost:8080',

	//MEDIA
	DRAX_MAX_UPLOAD_SIZE: '5000000',
	DRAX_FILE_DIR: 'uploads',
	DRAX_FILE_METADATA: 'true',

	//GOOGLE SSO / CONNECTIONS
	GOOGLE_CLIENT_ID: '',
	GOOGLE_CLIENT_SECRET: '',

	//EMAIL (Google)
	EMAIL_TYPE: 'gmail',
	EMAIL_AUTH_USERNAME: '',
	EMAIL_AUTH_PASSWORD: '',

	//EMAIL (SMTP)
	EMAIL_HOST: '',
	EMAIL_PORT: '465',
	EMAIL_AUTH_TYPE: 'login',
	EMAIL_SECURE: 'true',
	EMAIL_IGNORE_TLS: 'false',
	EMAIL_RATE_DELTA: '1000',
	EMAIL_RATE_LIMIT: '10',

	//IA
	AI_PROVIDER: 'GoogleAi',
	OPENAI_API_KEY: '',
	OPENAI_MODEL: 'gpt-5.4',
	OPENAI_VISION_MODEL: 'gpt-5.4',
	GOOGLE_AI_API_KEY: '',
	GOOGLE_AI_MODEL: 'models/gemini-3-flash-preview',
	AGENT_LOG_TOOL_EXECUTION: 'false',

	//JOBS
	AGENT_JOB_INTERVAL_MS: '60000',
	AGENT_JOB_RUN_LIMIT: '25',

	//PUSH (Firebase Cloud Messaging)
	FIREBASE_PROJECT_ID: '',
	FIREBASE_SERVICE_ACCOUNT_PATH: '',

	//TTS
	ELEVENLABS_API_KEY: '',
	ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io',
	ELEVENLABS_MODEL: 'eleven_multilingual_v2',
	ELEVENLABS_VOICE_ID: 'f6QiCN38OikU9jJdqQ7Z',
	ELEVENLABS_OUTPUT_FORMAT: 'mp3_44100_128',
};

module.exports = {
	apps: [
		{
			name: 'lifeops-assistant-api',
			script: './out/index.js',
			instances: 1,
			env: commonEnv
		},
		{
			name: 'lifeops-assistant-index-job',
			script: './out/index-job.js',
			instances: 1,
			env: commonEnv
		}
	]
};
