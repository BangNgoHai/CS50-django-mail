document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // submit email
  document.querySelector('#compose-form').addEventListener('submit', send_email); // once i submit email i want to call a function call end_email
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';

      document.querySelector('#email-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
        <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
        <li class="list-group-item"><strong>Tiemstamp:</strong>${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>      
      `

      // Cahnge to read
      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
      // Archive/Unarchived logic button creation
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = !email.archived ? "Archive" : "Unarchive";
      btn_arch.className = !email.archived ? "btn btn-success" : "btn btn-danger";
      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive')})
      });
      document.querySelector('#email-detail-view').append(btn_arch);

      // Reply logic
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply"
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = '';
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender}`;

      });
      document.querySelector('#email-detail-view').append(btn_reply);
  });
}

function load_mailbox(mailbox) {   // Sentbox from sender and inbox from receiver
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails for that mailbox and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Loop through emails and create div for each
      emails.forEach(singleEmail => {

        console.log(singleEmail);
        // create div for each email
        const newEmail = document.createElement('div');
        newEmail.className = 'list-group-item';
        newEmail.innerHTML = `
          <h6>Sender: ${singleEmail.sender}</h6>
          <h5>Subject: ${singleEmail.subject}</h5>
          <p>${singleEmail.timestamp}</p>  
        `;
        // change background color
        newEmail.className = singleEmail.read ? 'read': 'unread';
        // Add click event to view email
        newEmail.addEventListener('click', function() {
          view_email(singleEmail.id)
        });
        document.querySelector('#emails-view').append(newEmail);
      })
  });
}

function send_email(event) {
  event.preventDefault();

  // grap all the value
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //send the Data from Frontend to Backend
  fetch('/emails', {   // sent to url email 
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,  // data from above
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent'); // Redirect our page to sent after submit the mail
  });

}

