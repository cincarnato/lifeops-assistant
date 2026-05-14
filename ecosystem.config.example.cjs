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
	OPENAI_API_KEY: '',
	OPENAI_MODEL: 'gpt-5.4',
	OPENAI_VISION_MODEL: 'gpt-5.4',

	//JOBS
	AGENT_JOB_INTERVAL_MS: '60000',
	AGENT_JOB_RUN_LIMIT: '25',
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
