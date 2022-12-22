document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',sendMail);

  // By default, load the inbox
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name & clear previous child elements
  const view = document.querySelector('#emails-view');

  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox);
  if (mailbox != 'sent') {
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => { 
    console.log(emails)
    emails.forEach(email => {
      let list_email = document.createElement('div');
      let read = email['read'];
      if (read) {
          list_email.classList.add('boxed_read');
      } else {
          list_email.classList.add('boxed_unread');
      }
      list_email.innerHTML = `
        <b>From :  ${email['sender']}</b> </br> 
        Subject: ${email['subject']} </br>
         ${email['timestamp']}
        `;
        list_email.addEventListener('click', () => load_email(email['id'], false));
        view.appendChild(list_email);
    });
  })
} else {
  console.log(mailbox);
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    emails.forEach(email => {
      let list_email = document.createElement('div');
      let read = email['read'];
      list_email.classList.add('boxed_unread');
      list_email.innerHTML = `
        <b>From :  ${email['sender']}</b> </br> 
        Subject: ${email['subject']} </br>
         ${email['timestamp']}
        `;
        list_email.addEventListener('click', () => load_email(email['id'], true));
        view.appendChild(list_email);
    });
  })  
}
}

function load_email(id, sent) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch('/emails/' + id, {
    method: 'PUT',
    body: body = JSON.stringify({
      read: true
    })
  })
  if (sent) {
  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#email-view').innerHTML = `
      <div>From: ${email.sender}</div>
      <div>To: ${email.recipients}</div>
      <div>Subject: ${email.subject}</div>
      <div>Timestamp: ${email.timestamp}</div>            
    
      <hr>
      <div>
          ${email.body}
      </div>
      
    `;
    })
  } else {
    fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#email-view').innerHTML = `
      <div>From: ${email.sender}</div>
      <div>To: ${email.recipients}</div>
      <div>Subject: ${email.subject}</div>
      <div>Timestamp: ${email.timestamp}</div>            
      
      <div class="email-buttons">
          <button class="btn-email" id="reply" onclick="reply(${email.id})">Reply</button>
          <button class="btn-email" id="archive" onclick="archive(${email.id},${email.archived})">${email["archived"] ? "Unarchive" : "Archive"}</button>
      </div>
      <hr>
      <div>
        ${email.body}
      </div>
      
    `;
    })
  }
}

function reply(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
  // Show compose view and hide other views

  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + email.body + '<br>';
  
})
}

function sendMail(event) {
  event.preventDefault()
  var rec = document.querySelector('#compose-recipients').value;
  var sub = document.querySelector('#compose-subject').value;
  var bod = document.querySelector('#compose-body').value;

  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: rec,
      subject: sub,
      body: bod,
      read: false
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
}

function archive(id,archived) {
  console.log(id);
  if (archived){
    fetch('/emails/' + id , {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(result => {
      console.log(result);
      load_mailbox('inbox');
    });
  } else {
  fetch('/emails/' + id , {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })  
  .then(result => {
    console.log(result);
    load_mailbox('inbox');
  });
}
}






