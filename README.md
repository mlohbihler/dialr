# DiaLR
DiaLR is a live deployment service that helps you manage tricky deployments, allowing you
to control their release in real time. Get started now using our [free trial cloud service](https://dialr.serotonin.ai).

## Database
Create a database using the superuser:
```sql
create database <name>;
create user <user> with (encrypted) password '<password>';
grant all privileges on database <name> to <user>;
```

Then, update your .env file with the name (PGDATABASE), user (PGUSER), and password (PGPASSWORD) you used.

Create a client:
```sql
INSERT INTO users (email, password_hash) VALUES ('poly@andry.com', 'xxx');
```
Create an access key:
```sql
INSERT INTO access_keys (access_key, user_id) VALUES ('00112233-4455-6677-8899-aabbccddeeff', <userId>);
```
Create an experiment:
```sql
INSERT INTO experiments (user_id, experiment_uuid, title, request_ttl) VALUES (<userId>, '123e4567-e89b-12d3-a456-426655440000', 'test', 30);
```
Create branches for the experiment:
```sql
INSERT INTO branches (experiment_id, branch, probability) values
  (<experiment_id>, 'A', 20),
  (<experiment_id>, 'B', 30),
  (<experiment_id>, 'C', 50);
```

Drop the schema and migration history
```sql
DROP TABLE dbchangelog;
DROP TABLE single_use_tokens;
DROP TABLE access_keys;
DROP TABLE requests;
DROP TABLE branches;
DROP TABLE experiments;
DROP TABLE email_verifications;
DROP TABLE users;
```

Recreate rows above, and a few more to boot:
```sql
INSERT INTO users (email, password_hash) VALUES ('poly@andry.com', 'xxx');
INSERT INTO access_keys (access_key, user_id) VALUES ('00112233445566778899aabbccddeeff', 1);
INSERT INTO experiments (user_id, experiment_uuid, title, request_ttl, running) VALUES (1, '123e4567-e89b-12d3-a456-426655440000', 'test 1', 30, true);
INSERT INTO branches (experiment_id, branch, probability) VALUES
  (1, 'A', 20),
  (1, 'B', 30),
  (1, 'C', 50);
INSERT INTO experiments (user_id, experiment_uuid, title, request_ttl, running) VALUES (1, '123e4567-e89b-12d3-a456-426655440001', 'test 2', 30, true);
INSERT INTO branches (experiment_id, branch, probability) VALUES
  (2, 'asperagus', 1),
  (2, 'bok choy', 2),
  (2, 'cabbage', 3),
  (2, 'daikon', 4);
INSERT INTO experiments (user_id, experiment_uuid, title, request_ttl, running) VALUES (1, '123e4567-e89b-12d3-a456-426655440002', 'test 3', 10, true);
INSERT INTO branches (experiment_id, branch, probability) VALUES
  (3, 'this', 1),
  (3, 'that', 1);
INSERT INTO users (email, password_hash) VALUES ('cory@ander.com', 'yyy');
INSERT INTO email_verifications (user_id, expiry) VALUES (2, NOW());
```
