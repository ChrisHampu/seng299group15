

var socket = io();

// Utility functions to make up for not having jQuery
const $ = selector => document.querySelectorAll(selector);
const loadContent = selector => document.importNode($(selector)[0].content, true);

// Add an event to the selector that runs the 'functor' function
const on = (selector, event, functor) => {

  $(selector)[0].addEventListener(event, functor);
};

// selector: DOM node to append to
// nodes: DOM nodes to append; string
// class_: css class to apply to top level node
// id: id to apply to top level node
// type: type of top level node to create (default div)
const append = (selector, nodes, class_, id, type) => {

  const elType = type || 'div';

  const el = document.createElement(elType);
  el.innerHTML = nodes;

  if (class_)
    el.setAttribute("class", class_);
  if (id)
    el.setAttribute("id", id);

  if (typeof selector === "string")
    $(selector)[0].appendChild(el);
  else
    selector[0].appendChild(el);
};

function renderToBody(node) {

  let anchor = $("#body_anchor")[0];

  while (anchor.firstChild) {
    anchor.removeChild(anchor.firstChild);
  }

  anchor.appendChild(node);
}

function renderToHeaderRight(node) {

  let anchor = $("#right_menu_anchor")[0];

  while (anchor.firstChild) {
    anchor.removeChild(anchor.firstChild);
  }

  anchor.appendChild(node);
}

function renderCreateGame() {

  const content = loadContent("#createGameTemplate");

  renderToBody(content);
  
  const headerContent = loadContent("#createGamePageMenu");

  renderToHeaderRight(headerContent);

  on("#renderJoinGameButton", "click", () => {

    renderJoinGame();
  });

  on("#createGameButton", "click", () => {

    console.log("creategame");

    var typeRadios = document.getElementsByName('form_mode');

    let gameType = "AI";

    for (var i = 0, length = typeRadios.length; i < length; i++) {
      if (typeRadios[i].checked) {

        gameType = typeRadios[i].value;
        break;
      }
    }

    let colour = "Black";

    var colourRadios = document.getElementsByName('form_token');

    for (var i = 0, length = colourRadios.length; i < length; i++) {
      if (colourRadios[i].checked) {

        colour = colourRadios[i].value;
        break;
      }
    }

    var selector = document.getElementById("form_board");
    let boardSize = selector.options[selector.selectedIndex].value;

    socket.emit('createGame', gameType, boardSize, colour);
  });
}

function renderJoinGame() {
  const content = loadContent("#joinGameTemplate");

  renderToBody(content);

  const headerContent = loadContent("#joinGamePageMenu");

  renderToHeaderRight(headerContent);

  on("#renderCreateGameButton", "click", () => {
    
    renderCreateGame();
  });

  on("#joinGame", "click", () => {

    console.log("joingame called");

    var GameID = 123;
    var UserID = 1;
    socket.emit('joinGame', GameID, UserID);
  });
}

function renderUserInfo(user) {

  let anchor = $("#user_info_anchor")[0];

  while (anchor.firstChild) {
    anchor.removeChild(anchor.firstChild);
  }

  const content = $("#userHeaderInfoTemplate")[0].content;

  content.getElementById("user_picture").src = user.profilePicture;
  content.getElementById("user_name").innerHTML = user.fullName;

  let node = document.importNode(content, true)

  anchor.appendChild(node);
}

document.addEventListener('DOMContentLoaded', () => {

  renderCreateGame();
});
/*
document.getElementById("playmove").addEventListener("click", () => {

	console.log("playmove");

	var UserID = 1;
	var x = 2;
	var y = 3;
	socket.emit('playMove', UserID, x, y);
});

document.getElementById("passmove").addEventListener("click", () => {

	console.log("passmove called");

	var GameID = 123;
	var UserID = 1;
	socket.emit('passMove', GameID, UserID);
});

document.getElementById("joingame").addEventListener("click", () => {

	console.log("joingame called");

	var GameID = 123;
	var UserID = 1;
	socket.emit('joinGame', GameID, UserID);
});
*/
socket.on('gameCreated', game => {

  //document.getElementById("gameid").innerHTML = game.gameID;
  //document.getElementById("gameid").innerHTML = game.gameData.boardSize;
});

socket.on('connected', user => {
 
  renderUserInfo(user);
});