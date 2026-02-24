CREATE TABLE
  IF NOT EXISTS e_match_state (
    value INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS e_tournament_state (
    value INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS e_user_relation_type (
    value INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS e_user_status_type (
    value INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS google_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    google_user_id TEXT NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    update_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

CREATE TABLE
  IF NOT EXISTS password (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hash TEXT NOT NULL,
    update_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

CREATE TABLE
  IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    last_login TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    google_auth_id INTEGER UNIQUE,
    password_id INTEGER UNIQUE,
    FOREIGN KEY (google_auth_id) REFERENCES google_auth (id) ON DELETE SET NULL,
    FOREIGN KEY (password_id) REFERENCES password (id) ON DELETE SET NULL
  );

CREATE TABLE
  IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT NOT NULL,
	birth_date TEXT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    update_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    auth_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (auth_id) REFERENCES auth (id)
  );

CREATE TABLE
  IF NOT EXISTS user_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    code INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS recover_password (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS user_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type INTEGER NOT NULL,
    user_id INTEGER NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    update_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (type) REFERENCES e_user_status_type (value),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS download_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS user_relation (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type INTEGER NOT NULL,
    owner_user_id INTEGER NOT NULL,
    receiver_user_id INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    update_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (type) REFERENCES e_user_relation_type (value),
    FOREIGN KEY (owner_user_id) REFERENCES user (id),
    FOREIGN KEY (receiver_user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS tournament (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    round INT NOT NULL,
    is_visible BOOLEAN NOT NULL,
    players_amount INT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    finish_time TEXT,
    state INTEGER NOT NULL,
    points INTEGER NOT NULL,
    FOREIGN KEY (state) REFERENCES e_tournament_state (value)
  );

CREATE TABLE
  IF NOT EXISTS tournament_round (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    top TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    tournament_id INTEGER NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournament (id)
  );

CREATE TABLE
  IF NOT EXISTS tournament_player (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    round INT NOT NULL,
	is_winner BOOLEAN NOT NULL DEFAULT FALSE,
	is_alive BOOLEAN NOT NULL DEFAULT TRUE,
    user_id INTEGER NOT NULL,
	creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    tournament_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (tournament_id) REFERENCES tournament (id)
  );

CREATE TABLE
  IF NOT EXISTS match (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL,
    is_visible BOOLEAN NOT NULL,
    tournament_round_id INTEGER,
    state INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    finish_time TEXT,
    FOREIGN KEY (state) REFERENCES e_match_state (value),
    FOREIGN KEY (tournament_round_id) REFERENCES tournament_round (id)
  );

CREATE TABLE
  IF NOT EXISTS match_player (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    score INT NOT NULL,
    is_winner BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
	creation_time TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (match_id) REFERENCES match (id)
  );

INSERT INTO e_user_status_type (name) VALUES ('ONLINE');
INSERT INTO e_user_status_type (name) VALUES ('OFFLINE');

INSERT INTO e_user_relation_type (name) VALUES ('FRIENDSHIP_REQUESTED');
INSERT INTO e_user_relation_type (name) VALUES ('FRIENDSHIP_ACCEPTED');
INSERT INTO e_user_relation_type (name) VALUES ('BLOCKED');

INSERT INTO e_match_state (name) VALUES ('WAITING');
INSERT INTO e_match_state (name) VALUES ('IN_PROGRESS');
INSERT INTO e_match_state (name) VALUES ('FINISHED');

INSERT INTO e_tournament_state (name) VALUES ('WAITING');
INSERT INTO e_tournament_state (name) VALUES ('CLOSED');
INSERT INTO e_tournament_state (name) VALUES ('IN_PROGRESS');
INSERT INTO e_tournament_state (name) VALUES ('FINISHED');
