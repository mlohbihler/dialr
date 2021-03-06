CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash varchar(128) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verifications (
  user_id INTEGER NOT NULL PRIMARY KEY REFERENCES users (user_id) ON DELETE CASCADE,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE access_keys (
  access_key VARCHAR(32) NOT NULL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE experiments (
  experiment_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  experiment_uuid UUID NOT NULL UNIQUE,
  title VARCHAR(32) NOT NULL,
  description TEXT,
  request_ttl INTEGER NOT NULL,
  running BOOLEAN NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
  experiment_id INTEGER NOT NULL REFERENCES experiments (experiment_id) ON DELETE CASCADE,
  branch VARCHAR(10) NOT NULL,
  probability INTEGER NOT NULL,
  sort INTEGER NOT NULL,
  PRIMARY KEY (experiment_id, branch)
);

CREATE TABLE requests (
  experiment_id INTEGER NOT NULL,
  request_id VARCHAR(64) NOT NULL,
  branch VARCHAR(10) NOT NULL,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  outcome TEXT,
  PRIMARY KEY (experiment_id, request_id)
);

CREATE TABLE single_use_tokens (
  token VARCHAR(64) NOT NULL PRIMARY KEY,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  content JSONB
);
