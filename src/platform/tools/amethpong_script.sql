PRAGMA foreign_keys = ON;

CREATE TABLE
  IF NOT EXISTS e_match_type (
    value INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  );

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
    google_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expiration_time TEXT NOT NULL,
    scope TEXT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    update_time TEXT NOT NULL DEFAULT current_timestamp
  );

CREATE TABLE
  IF NOT EXISTS password (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hash TEXT NOT NULL,
    update_time TEXT NOT NULL DEFAULT current_timestamp
  );

CREATE TABLE
  IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    last_login TEXT NOT NULL DEFAULT current_timestamp,
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
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    update_time TEXT NOT NULL DEFAULT current_timestamp,
    auth_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (auth_id) REFERENCES auth (id)
  );

CREATE TABLE
  IF NOT EXISTS user_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    code INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS recover_password (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS user_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type INTEGER NOT NULL,
    user_id INTEGER NOT NULL UNIQUE,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (type) REFERENCES e_user_status_type (value),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS user_relation (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    alias TEXT,
    type INTEGER NOT NULL,
    owner_user_id INTEGER NOT NULL,
    receiver_user_id INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    update_time TEXT NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (type) REFERENCES e_user_relation_type (value),
    FOREIGN KEY (owner_user_id) REFERENCES user (id),
    FOREIGN KEY (receiver_user_id) REFERENCES user (id)
  );

CREATE TABLE
  IF NOT EXISTS tournament (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    token TEXT NOT NULL,
    round INT NOT NULL,
    is_visible BOOLEAN NOT NULL,
    players_amount INT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    finish_time TEXT,
    state INTEGER NOT NULL,
    FOREIGN KEY (state) REFERENCES e_tournament_state (value)
  );

CREATE TABLE
  IF NOT EXISTS tournament_round (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    top TEXT NOT NULL,
    token TEXT NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    tournament_id INTEGER NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournament (id)
  );

CREATE TABLE
  IF NOT EXISTS match (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    token TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL,
    tournament_round_id INTEGER,
    state INTEGER NOT NULL,
    type INTEGER NOT NULL,
    creation_time TEXT NOT NULL DEFAULT current_timestamp,
    finish_time TEXT,
    FOREIGN KEY (state) REFERENCES e_match_state (value),
    FOREIGN KEY (type) REFERENCES e_match_type (value),
    FOREIGN KEY (tournament_round_id) REFERENCES tournament_round (id)
  );

CREATE TABLE
  IF NOT EXISTS match_player (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    score INT NOT NULL,
    is_winner BOOLEAN NOT NULL,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (match_id) REFERENCES match (id)
  );

CREATE TABLE
  IF NOT EXISTS tournament_player (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    round INT NOT NULL,
    user_id INTEGER NOT NULL,
    tournament_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (tournament_id) REFERENCES tournament (id)
  );

INSERT INTO e_user_status_type (name) VALUES ('OFFLINE');
INSERT INTO e_user_status_type (name) VALUES ('ONLINE');

INSERT INTO e_user_relation_type (name) VALUES ('FRIENDSHIP_REQUESTED');
INSERT INTO e_user_relation_type (name) VALUES ('FRIENDSHIP_ACCEPTED');
INSERT INTO e_user_relation_type (name) VALUES ('BLOCKED');

INSERT INTO e_match_type (name) VALUES ('LOCAL');
INSERT INTO e_match_type (name) VALUES ('REMOTE');
INSERT INTO e_match_type (name) VALUES ('TOURNAMENT');

INSERT INTO e_match_state (name) VALUES ('WAITING');
INSERT INTO e_match_state (name) VALUES ('IN_PROGRESS');
INSERT INTO e_match_state (name) VALUES ('FINISHED');

INSERT INTO e_tournament_state (name) VALUES ('WAITING');
INSERT INTO e_tournament_state (name) VALUES ('CLOSED');
INSERT INTO e_tournament_state (name) VALUES ('IN_PROGRESS');
INSERT INTO e_tournament_state (name) VALUES ('FINISHED');


-- DUMMY DATA --

INSERT INTO match (name, token, is_visible, state, type) VALUES ('partidaza', 'a35Fda1', 0, 2, 2);

INSERT INTO match_player (score, is_winner, user_id, match_id)
  SELECT 5, 1, u.id, m.id FROM (
    SELECT id FROM user WHERE username='cfidalgo'
  ) AS u CROSS JOIN (
    SELECT id FROM match ORDER BY id DESC LIMIT 1
  ) AS m;

INSERT INTO match_player (score, is_winner, user_id, match_id)
  SELECT 0, 0, u.id, m.id FROM (
    SELECT id FROM user WHERE username='vperez-f'
  ) AS u CROSS JOIN (
    SELECT id FROM match ORDER BY id DESC LIMIT 1
  ) AS m;
