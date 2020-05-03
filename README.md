# eyevocalize

**eyevocalize** holds all of the server and client code for what ultimately becomes https://EyeVocalize.com.


The code includes a small website and a fairly substantial text-to-speech Web application.
The webapp runs in the browser and invokes browser speech synthesis to vocalize text.

## Background

The webapp was written by Jon Ferraiolo, a person with advanced ALS, who had lost his ability to speak or use his hands;
therefore, he is dependent on eye gaze technology in order to operate a computer.
He developed the software for his own particular needs and around his particular setup.

**The EyeVocalize application will be useful to very few people.** To find it useful, a user will need to be:

* Paralyzed hands and unable to speak
* Highly proficient on eye gaze technology, such as the Tobii PC Eye Mini.

## Requirements

The code is all JavaScript: Nodejs server and modern Web on the client.

The server requires MySQL for its small persistent storage needs.

The server also requires a free email sending account on SendGrid for user signup, including when running localhost.
After signing up with SendGrid, get your secret account code, which you will need to enter into the JSON config file.  

The code has only been tested on Windows browsers; in particular,
latest automatic updates to Chrome, Firefox and Edge.
(The reasons for why the app only works on desktop Windows is that is all the author needed and all the author was capable of using.)

## Getting it running

* Install latest versions of Nodejs, git and MySQL server.
* git clone the repository
* go to the base directory for the project
* npm install
* create a JSON configuration file with the following contents, substituting appropriate values, and save in a directory not outside of the git project:

{
  "BASE_URL": "http://localhost:3000",
  "HOSTNAME": "localhost",
  "PROTOCOL": "http",
  "PORT": "3000",
  "SSL_DB": null,
  "SSL_DIR": null,
  "SSL_KEY": null,
  "SSL_CERT": null,
  "SOCKETIO_OPTIONS": {"transports": ["polling"]},
  "DB_HOST": "localhost",
  "DB_DATABASE": "changeme",
  "DB_USER": "changeme",
  "DB_PASSWORD": "changeme",
  "DB_TABLE_PREFIX": "changeme",
  "DB_FORCE_CREATION": false,
  "DB_DEBUG": false,
  "HASH_SECRET1": "changeme",
  "HASH_SECRET2": "changeme",
  "HASH_IV": null,
  "LOGDIR": null,
  "SENDGRID_API_KEY": "changeme",
  "PROBLEM_EMAIL": "changeme"
}

* set environment variable EVC_CONFIG to the path to the JSON config file, relative to the server.js file in the project root directory
* npm install
* npm start
* direct browser to http://localhost:3000
