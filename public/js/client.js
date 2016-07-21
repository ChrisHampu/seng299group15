

var socket = io();
let activeGame = undefined;
let boardState = undefined;
let selfUser = undefined;
let opponentUser = undefined;

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

const makeRectangle = (x, y, w, h, c) => {
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); 

  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);

  rect.style.stroke      = "#000000";
  rect.style.strokeWidth = 2;
  rect.style.fill = "#dcb35c";

  return rect; 
}

const makeCircle = (x, y, r, c) => {

   var circ = document.createElementNS("http://www.w3.org/2000/svg", "circle"); 

    circ.setAttribute("cx", x);
    circ.setAttribute("cy", y);
    circ.setAttribute("r", r);

    circ.setAttribute("fill", c || "#ffffff");

   return circ;
}

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

    const id = document.getElementById("game_id_input").value;
    //var GameID = 123;
    //var UserID = 1;
    socket.emit('joinGame', id);
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

function renderTitleText(title) {

  document.getElementById("game_title").innerHTML = title;
}

function renderTurnText(title) {

  document.getElementById("game_turn").innerHTML = title;
}

function renderPlayGame(game) {
  const content = loadContent("#gamePlayTemplate");

  let title = "";

  if (game.gameType === "Network") {

    if (!game.playerTwo) {
      title = "Waiting for Opponent";
      content.getElementById("game_id").innerHTML = `Game ID: ${game.gameID.slice(0, 8)}`;
    } else {
      title = game.playerTwo.fullName;
    }

  } else if(game.gameType === "AI") {

    title = "Playing vs AI";

    if (game.playerOne.colour === "Black") {
      renderTurnText("Your turn");
    } else {
      renderTurnText("AI's turn");
    }
  } else if(game.gameType === "Hotseat") {

    title = "Hotseat Go";

    renderTurnText("Black piece's turn");
  }

  content.getElementById("game_title").innerHTML = title;

  renderToBody(content);

  const headerContent = loadContent("#playGamePageMenu");

  renderToHeaderRight(headerContent);

  on("#leaveGameButton", "click", () => {

    // User is leaving game
    // Emit appropriate events to server

    renderCreateGame();
  });

  const gameContainer = $("#game_container")[0];
  const gameBoard = $("#game_board")[0];
  const rectHolder = $("#game_rect")[0];

  const containerWidth = gameContainer.clientWidth;
  const containerHeight = gameContainer.clientHeight;

  const smallest = Math.min(containerWidth, containerHeight);

  const boardWidth = smallest;
  const boardHeight = smallest;

  gameBoard.style.height = boardHeight;
  gameBoard.style.width = boardWidth;

  const wScale = boardWidth / (game.boardSize || 1);
  const hScale = boardHeight / (game.boardSize || 1);
  const circlePadding = 10;

  let startX = wScale / 2;
  let startY = hScale / 2;

  for (var i = 0; i < game.boardSize; i++) {

      for (var j = 0; j < game.boardSize; j++) {

          // Avoid drawing extra lines
          if (startX <= boardWidth - wScale && startY <= boardHeight - hScale) {

            let rekt = makeRectangle(startX, startY, wScale, hScale);

            rectHolder.appendChild(rekt);
          }

          startX += wScale;
      }

      startY += hScale;
      startX = wScale / 2;
  }

  activeGame = {
    game,
    boardWidth,
    boardHeight,
    wScale,
    hScale,
    startX: wScale / 2,
    startY: hScale / 2,
    circlePadding,
    gameBoard
  };

  $("#game_board")[0].addEventListener('click', (ev) => {    

    let hitX = ev.offsetX;
    let hitY = ev.offsetY;

    if (ev.target.nodeName !== "svg") {

      // Magic numbers, nothing to see here
      //let multi = game.boardSize === 9 ? 0.98 : (game.boardSize === 13 ? 1.25 : 1.75);

      //hitX -= ((ev.offsetX * multi) / boardHeight) * wScale;
      //hitY -= ((ev.offsetY * multi) / boardHeight) * hScale;
    }

    const findClosest = (goal, list) => list.reduce(function (prev, curr) {
      return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });

    let xHits = [];
    let startX = wScale / 2;

    for (var i = 0; i <= game.boardSize; i++) {
      xHits.push(startX);
      startX += wScale;
    }

    let yHits = [];
    let startY = hScale / 2;

    for (var i = 0; i <= game.boardSize; i++) {
      yHits.push(startY);
      startY += hScale;
    }

    hitX = findClosest(hitX, xHits);
    hitY = findClosest(hitY, yHits);

    let x = Math.floor(hitX / wScale);
    let y = Math.floor(hitY / hScale);

    socket.emit('playMove', x, y);
  });
}

function renderBoardTokens(board) {

  const tokenHolder = $("#game_tokens")[0];

  tokenHolder.innerHTML = "";

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {

      const token = board[i][j];

      if (token) {

        let hitX = activeGame.startX + i * activeGame.wScale;
        let hitY = activeGame.startY + j * activeGame.hScale;

        let circ = makeCircle(hitX, hitY, 
          Math.min(activeGame.wScale / 1.65 - activeGame.circlePadding, activeGame.hScale / 1.65 - activeGame.circlePadding),
          token === "Black" ? "url('#blackGrad')" : "url('#whiteGrad')");

        tokenHolder.appendChild(circ);
      }
    }
  }
}

 // Application entry point
document.addEventListener('DOMContentLoaded', () => {

  renderCreateGame();
});

socket.on('gameCreated', game => {

  console.log(game);

  renderPlayGame(game);

  selfUser = game.playerOne;
  opponentUser = game.playerTwo;
});

socket.on('failJoinGame', msg => {

  document.getElementById("join_game_fail").innerHTML = msg;
});

socket.on('connected', user => {
  console.log(user);
  renderUserInfo(user);
});

socket.on('showMove', (colour, x, y, pass) => {

  if (!pass) {
    let hitX = activeGame.startX + x * activeGame.wScale;
    let hitY = activeGame.startY + y * activeGame.hScale;

    let circ = makeCircle(hitX, hitY, 
      Math.min(activeGame.wScale / 1.65 - activeGame.circlePadding, activeGame.hScale / 1.65 - activeGame.circlePadding),
      colour === "Black" ? "url('#blackGrad')" : "url('#whiteGrad')");

    activeGame.gameBoard.appendChild(circ);
  }

  if (selfUser.colour !== colour) {
    if (pass === true) {
      renderTurnText("Opponent passed");
    } else if (!pass) {
      renderTurnText("Your turn");
    }
  } else {
    if (pass === true) {
      renderTurnText("You passed");
    } else if (!pass) {
      renderTurnText("Opponents turn");
    }
  }
});

socket.on('showBoard', board => {

  renderBoardTokens(board);
});

socket.on('playerJoined', opponent => {

  document.getElementById("game_id").innerHTML = "";

  let selfColour = opponent.colour === "White" ? "Black" : "White";

    opponentUser = opponent;

  if (selfColour === "Black") {
    renderTurnText("Your turn");
  } else {
    renderTurnText("Opponents turn");
  }

  renderTitleText(`Playing as ${selfColour} vs ${opponent.fullName}`);
});

socket.on('joinGame', (game, self, opponent) => {

  renderPlayGame(game);

  let selfColour = self.colour;
  let opponentColour = selfColour === "White" ? "Black" : "White";

  renderTitleText(`Playing as ${selfColour} vs ${opponent.fullName}`);

  selfUser = self;
  opponentUser = opponent;

  if (selfColour === "Black") {
    renderTurnText("Your turn");
  } else {
    renderTurnText("Opponents turn");
  }
});