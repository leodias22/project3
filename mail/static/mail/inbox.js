document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Leonardo - Sends email after filling the form
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  //Leonardo - Clear the list of emails
  document.querySelector('#email-list').innerHTML = null;
  document.querySelector('#email-archive').innerHTML = null;
  document.querySelector('#email-reply').innerHTML = null;

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  //Leonardo - hide the archive and reply button
  document.querySelector('#email-archive').style.display = 'none';
  document.querySelector('#email-reply').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  //Leonardo - hide the archive and reply button
  document.querySelector('#email-archive').style.display = 'none';
  document.querySelector('#email-reply').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //Leonardo - Load emails
    fetch('/emails/'+mailbox)
    .then(response => response.json())
    .then(emails => {
    // Print emails
    console.log(emails);
    document.querySelector('#email-list').innerHTML = null;
    document.querySelector('#email-archive').innerHTML = null;
    document.querySelector('#email-reply').innerHTML = null;

    for (let index = 0; index < emails.length; index++) {
      var read = emails[index].read;
      if(read){
        color = '-secondary';
      }else{
        color = '-light';
      }
      var title = emails[index].subject;
      var by = emails[index].sender;
      var time = emails[index].timestamp;
      var div = document.createElement("div");
      div.className = "border border-grey justify-content-between list-group-item-action d-flex list-group-item"+color;
      div.innerHTML = '<h5 class="mb-1">'+ title + '</h5>'  + '<small>' + time +'</small>'+'<div>'+ by + '</div>';
      div.addEventListener('click', () => load_email(emails[index].id, mailbox));
      document.querySelector('#email-list').append(div);
    }
    // ... do something else with emails ...
});

}

// Leonardo - Sends the email 
function send_email(){
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      const alerta = result["error"];
      if (alerta != null){
        alert(`reply${alerta}`);
      }
      
  })
  .then(()=>{
    load_mailbox("sent")
  })
}

//Leonardo - view single email
function load_email(id, mailbox){

  //Leonardo - 1st the offered code to get email contents
  fetch('/emails/'+id)
  .then(response => response.json())
  .then(email => {
    // Print email
      console.log(email);

    // ... do something else with email ...
    //Leonardo - Finally, hide all elements and show the selected email contents
    document.querySelector('#email-list').innerHTML = null;
    document.querySelector('#email-archive').innerHTML = null;
    document.querySelector('#email-reply').innerHTML = null;

    //Leonardo - create and show a reply button
    document.querySelector('#email-reply').style.display = 'block';
    var replying = document.createElement('button');
    replying.className = "btn btn-primary btn-sm";
    replying.innerHTML = 'Reply';
    document.querySelector('#email-reply').append(replying);

    document.querySelector('#emails-view').innerHTML = `<h3>${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}</h3>`;
    var sent = document.createElement('div');
    var receipt = document.createElement('div');
    var time = document.createElement('div');
    var contents = document.createElement('div');
    sent.innerHTML = 'Sent by: '+email.sender;
    document.querySelector('#email-list').append(sent);
    receipt.innerHTML = 'Recipients: '+email.recipients;
    document.querySelector('#email-list').append(receipt);
    time.innerHTML = 'Sent on: '+email.timestamp;
    document.querySelector('#email-list').append(time);
    contents.className = "border border-dark"
    contents.innerHTML = email.body;
    document.querySelector('#email-list').append(contents);
    //Leonardo - show the archive button
    document.querySelector('#email-archive').style.display = 'block';

    //Leonardo - Archive quality
    var archive = document.createElement('button');
    archive.className = "btn btn-primary btn-sm";
    if(mailbox === 'inbox'){
      archive.innerHTML = 'Archive';
      archive.addEventListener('click', () => {
        fetch('/emails/'+id, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(() =>{
          load_mailbox('inbox')
        });
      });
      document.querySelector('#email-archive').append(archive);
      
    } else if (mailbox === 'archive'){
      archive.innerHTML = 'Unarchive';
      archive.addEventListener('click', () => {
        fetch('/emails/'+id, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(() =>{
          load_mailbox('inbox')
        });
      });
      document.querySelector('#email-archive').append(archive);
    }
    
  });
  //Leonardo - Then tag the email as read (code also offered)
  fetch('/emails/'+id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  

}


