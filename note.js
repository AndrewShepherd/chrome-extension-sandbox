var timeoutID;

function showMessage(msg, good) {
  console.log(msg);
  var messageElement = document.querySelector("#message");
  messageElement.style.color = good ? "green" : "red";
  messageElement.innerHtml = msg;
  if(timeoutID) {
    clearTimeout(timeoutID);
  }
  timeoutID = setTimeout(
        function() {
          messageElement.innerHTML = "&nbsp";
        },
        5000
    );
}


function errorHandler(e) {
  console.dir(e);
  var msg;
  if(e.target && e.target.error) {
    e = e.target.error;
  }
  if(e.message) {
    msg = e.message;
  } else if (e.name) {
    msg = e.name;
  }
  else if (e.code) {
    msg = "Code " + e.code;
  }
  else {
    msg = e.toString();
  }
  showMessage('Error: ' + msg);
}


function save(e) {
  showMessage("You clicked save!", true);
};

window.onload = function() {
  var requestFileSystem = window.webkitRequestFileSystem || window.requestFileSystem;
  requestFileSystem(PERSISTENT, 0, haveFileSystem, errorHandler);
  document.querySelector("#save").addEventListener("click", save);
};