// Install these libraries using npm install.
const Mailchimp = require('mailchimp-api-v3');
var md5 = require('md5');

// load and create api key and list id constants
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

// This bad boy will have the honor of representing mailchimp :)
let mailchimp;

// If api constant is not undefined go head and instatiate mailchimp
if(MAILCHIMP_API_KEY){
  mailchimp = new Mailchimp(MAILCHIMP_API_KEY);
}
// This flag is set to whether mailchimp is empty
const isEmptyMailchimp = typeof mailchimp === Object && mailchimp.keys(mailchimp).length === 0 && mailchimp.constructor === Object;

// ==========> This function is in charge of actually trying to add a subscriber <==============
const addSubscriber = (email, data, update) => {

    // Make sure mailchimp, email and listid are all set and not undefined
    if (!mailchimp || !email || isEmptyMailchimp || !MAILCHIMP_LIST_ID) {
        const msg = `Ignoring adding subscriber, missing params ${!email ? 'email': 'API Key or List ID'}`;
        console.warn(msg);
        return Promise.reject({ msg });
    }

    return mailchimp.post(`lists/${MAILCHIMP_LIST_ID}`, {
        update_existing: update !== undefined ? update : true,
        members: [{
            email_address: email.toLowerCase(),
            status : data.status || 'subscribed',
            merge_fields: {
                'GETTEST' : 'Yes',
                'MMERGE1' : data.name,
                'EMAIL' : email
              }
        }],
    }).then(m => {
        if (m && Object.keys(m.errors).length > 0) {
            console.log('Error adding new subscriber to MC', m.errors);
            return Promise.reject({ m });
        }
        addTag(email)
        return Promise.resolve({ m });
    }).catch(err => {
        console.warn('Failed adding subscriber', email, err);
        return Promise.reject({ err });
    });
}

// ==========> This function is in charge of adding a tag to an already subscribed user with the given email <==============
const addTag = email => {
  let emailHash = md5(email.toLowerCase());
  return mailchimp.post(`lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags`, {
    tags: [{"name": "From Test Landing", "status": "active"}]
  }).then(m => {
      if (m && m.errors && Object.keys(m.errors).length > 0) {
          console.log('Error adding tag to subscriber ', m.errors);
      }
      return m;
  }).catch(err => {
      console.warn('Failed to tag subscriber', email, err._links);
  });
}

module.exports = {
    addSubscriber,
}