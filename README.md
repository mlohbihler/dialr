# DiaLR
DiaLR is a live deployment service that helps you manage tricky deployments, allowing you
to control their release in real time. Get started now using our [free trial cloud service](https://dialr.serotonin.ai).

## Architecture
The DiaLR project consists of three main parts:

- server: a Node-based RESTful server. Endpoints exist for the UI (ui), and the client (mi). There are also a few jobs that run on schedules.
- ui: a Vue-based single page application. This is how users configure the service, and create experiments. It is expected that the server will serve this UI to the browsers.
- client: an example of how to write a basic client that communicates with the server's 'mi' endpoints. This is how your code will communicate with the server.

The server requires a Postgres database installation and an SMTP server. The installation instructions below use the yarn package manager.

## Installation

First, prepare the database. Download, install, and start the Postgres database if you don't have an existing installation. Then, log in with your superuser credentials and create a database for DiaLR.

```sql
create database <name>;
create user <user> with (encrypted) password '<password>';
grant all privileges on database <name> to <user>;
```

Second, build the UI. First you need to create a UI configuration file named `dialr/ui/.env.local`. See the contents of `dialr/ui/.env` for the properties that need to be set. Then, build the UI using the following commands.

```bash
cd dialr/ui
yarn install
yarn build
```

The first comment will download all of the packages the UI depends upon. The second command will build the UI into the `dist` directory. Copy the contents of the `dist` directory to the `dialr/server/static` directory (you may need to create it first). 

Third, create a configuration file for your server named `dialr/server/.env`. See the contents of `dialr/server/env/sample.env` for the properties that need to be set.

Finally, start the server. This can be simply done using `yarn start` from the `dialr/server` directory. Part of the server startup is to find scripts in the `sql` directory and execute them. This keeps your database up to date with the DiaLR code.

Congratulations! Your instance of DiaLR is now running. One of the startup messages will tell you the port on which your instance is running. Use a browser to visit the UI at that port.

## How to use DiaLR

Login via the UI, creating a new user if necessary. (If you do not log out, your cookie will remain valid for 30 days.) Then, use the UI to create access keys and experiments. 

Access keys represent permission to access any experiment for the user account that owns the access key.

Experiments should represent a single feature that you wish to dynamically deploy. Use the UUID in your client code to reference a particular experiment. See the information on the DiaLR home page for details.

The application is designed to be very intuitive to use. If you think it's not, or have questions or concerns, let us know here: https://github.com/mlohbihler/dialr/issues.

## Danger zone

If for any reason you need to drop and recreate your database, you can drop all of the tables with the following commands. The next time you start your instance the server will create all of the tables.

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
