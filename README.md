# dialr
Dialr live deployment service

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
INSERT INTO clients (email, password_hash) VALUES ('poly@andry.com', 'xxx');
```
Create an access key:
```sql
INSERT INTO access_keys (access_key, client_id) VALUES ('00112233-4455-6677-8899-aabbccddeeff', <clientId>);
```
Create an experiment:
```sql
INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (<clientId>, '123e4567-e89b-12d3-a456-426655440000', 'test', 30);
```
Create branches for the experiment:
```sql
INSERT INTO branches (experiment_id, branch, probability, sort) values
  (<experiment_id>, 'A', 20, 1),
  (<experiment_id>, 'B', 30, 2),
  (<experiment_id>, 'C', 50, 3);
```

Drop the schema and migration history
```sql
DROP TABLE dbchangelog;
DROP TABLE access_keys;
DROP TABLE requests;
DROP TABLE branches;
DROP TABLE experiments;
DROP TABLE clients;
```

Recreate rows above, and a few more to boot:
```sql
INSERT INTO clients (email, password_hash) VALUES ('poly@andry.com', 'xxx');
INSERT INTO access_keys (access_key, client_id) VALUES ('00112233-4455-6677-8899-aabbccddeeff', 1);
INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440000', 'test 1', 30);
INSERT INTO branches (experiment_id, branch, probability, sort) values
  (1, 'A', 20, 1),
  (1, 'B', 30, 2),
  (1, 'C', 50, 3);
INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440001', 'test 2', 30);
INSERT INTO branches (experiment_id, branch, probability, sort) values
  (2, 'asperagus', 1, 1),
  (2, 'bok choy', 2, 2),
  (2, 'cabbage', 3, 3),
  (2, 'daikon', 4, 4);
INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440002', 'test 3', 10);
INSERT INTO branches (experiment_id, branch, probability, sort) values
  (3, 'this', 1, 1),
  (3, 'that', 1, 2);
```
