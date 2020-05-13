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
* Sign up for SendGrid (see above) if you want to use signup, login and sync features
* git clone the repository
* create a JSON configuration file with the following contents, substituting appropriate values, and save in a directory not outside of the git project:

```
{
  "BASE_URL": "http://localhost:3000",
  "HOSTNAME": "localhost",
  "PROTOCOL": "http",
  "PORT": "3000",
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
```

* set environment variable `EVC_CONFIG` to the path to the JSON config file, relative to the server.js file in the project root directory
* go to the base directory for the project
* npm install
* npm start
* direct browser to http://localhost:3000

## Server notes

The server uses expressjs.

The server is fairly minimal. Most of the code is in the client.

Look at `./server.js` source code comments for additional details.

## Client notes

### lit-html

The client uses lit-html for almost everything.

For those who are not familiar with lit-html but are familiar with Reactjs:

* lit-html has a similar virtual DOM approach, except instead of massive data structures that duplicate the real DOM, lit-html uses the real DOM for its magic.
* Instead of dozens of major APIs and a steep learning curve, lit-html only has two main functions: `render` and `html`. The `render` function is super-simple. `html` is the complicated one, but you should be able to figure it oot in a day or so. Here is a short example:

```
render(html`
  <div class=PageContainer>
    <div class=Page>
      <div class=PageTopBar>
        <label><span class=logo></span>EyeVocalize.com</label>
        <span class=PageTopBarButtons>
          <button @click=${tryit} class=TryIt>Try It</button>
          <button @click=${signup} class=SignUp>Sign Up</button>
          <button @click=${login} class=Login>Login</button>
        </span>
    ... Other content snipped ...
  </div>`, document.body);
```

* Instead of JSX, lit-html takes advantage of a relatively recent addition to JavaScript: [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). (see example above)
* lit-html does not have any mechanisms for storing state and triggering updates when state changes. You have to roll your own state management and update logic, which I found I liked better than having to code to the particular rules of Reactjs.

### modules

All client JavaScript files are coded as [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## socket.io and the data synchronization feature  

The server and the client implement the data synchronization feature using socket.io.

Theoretically, on modern servers and clients, we should be able to run socket.io over Web sockets. However, developers who look at EyeVocalize.com will notice that the site uses long polling instead of Web sockets. This is because of issues with the hosting site.

The data synchronization feature is quite complicated. This is largely due to the complexity of all the possible scenarios. Good luck if you encounter problems. I have tried to comment in the code why things are done in a particular way.
