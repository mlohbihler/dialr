# dialr
Dialr live deployment service

## Database
Create a database using the superuser:
    create database <name>;
    create user <user> with (encrypted) password '<password>';
    grant all privileges on database <name> to <user>;

Then, update your .env file with the name (PGDATABASE), user (PGUSER), and password (PGPASSWORD) you used.

Create a client:
    INSERT INTO clients (email, password_hash, modified) VALUES ('poly@andry.com', 'xxx', 999999);
Create an access key:
    INSERT INTO access_keys (access_key, client_id, modified) VALUES ('00112233-4455-6677-8899-aabbccddeeff', <clientId>, 999999);
Create an experiment:
    INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl, modified) VALUES (<clientId>, '123e4567-e89b-12d3-a456-426655440000', 'test', 30, 999999);
Create branches for the experiment:
    INSERT INTO branches (experiment_id, branch, probability, sort) values
      (<experiment_id>, 'A', 20000, 1),
      (<experiment_id>, 'B', 30000, 1),
      (<experiment_id>, 'C', 50000, 1);

Drop the schema and migration history
    DROP TABLE dbchangelog;
    DROP TABLE access_keys;
    DROP TABLE requests;
    DROP TABLE branches;
    DROP TABLE experiments;
    DROP TABLE clients;

Recreate rows above:
    INSERT INTO clients (email, password_hash) VALUES ('poly@andry.com', 'xxx');
    INSERT INTO access_keys (access_key, client_id) VALUES ('00112233-4455-6677-8899-aabbccddeeff', 1);
    INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440000', 'test 1', 30);
    INSERT INTO branches (experiment_id, branch, probability, sort) values
      (1, 'A', 20000, 1),
      (1, 'B', 30000, 2),
      (1, 'C', 50000, 3);
    INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440001', 'test 2', 30);
    INSERT INTO branches (experiment_id, branch, probability, sort) values
      (2, 'asperagus', 10000, 1),
      (2, 'bok choy', 20000, 2),
      (2, 'cabbage', 30000, 3),
      (2, 'daikon', 40000, 4);
    INSERT INTO experiments (client_id, experiment_uuid, title, request_ttl) VALUES (1, '123e4567-e89b-12d3-a456-426655440002', 'test 3', 10);
    INSERT INTO branches (experiment_id, branch, probability, sort) values
      (3, 'this', 1, 1),
      (3, 'that', 1, 2);
