//clase que contiene un jugador
class Player {
  token;
  code;
  nombre;
  attack;
  defense;
  direction;
  image;
  name;
  object;
  vitalpoints;
  x;
  y;
  kills;

  //vacia los campos de un jugador
  emptyPlayer() {
    for (var i in this) {
      this[i] = null;
    }
  }
}

//clase para los enemigos
class Enemy {
  image;
  vitalpoints;
  constructor(direction, x, y) {
    this.direction = direction;
    this.x = x;
    this.y = y;

  }

  //vacia los campos de un enemigo
  emptyEnemy() {
    for (var i in this) {
      this[i] = null;
    }
  }

  //mira si todos los valores de un enemigo son iguales que este
  equals(enemy) {
    var igual = true;
    for (var i in this) {
      if (this[i] != enemy[i]) {
        igual = false;
      }
    }
    return igual;
  }
}

var group_token = "b89f96ae"; //nuestro token

var player = new Player; //jugador

var matar_enemy = new Enemy; //enemigo que esta delante del jugador

var enemies_map = []; //array de todos los enemigos que hay en el mapa

var enemies_close = []; //array de enemigos en las casillas contiguas al usuario

var combat = false; //si el usuario esta en combate con un enemigo es true

var angle = 0; //angulo de la aguja de la brujula

var directions = []; //array que contiene los puntos cardinales en orden dependiendo de a donde mire el usuario

var dead = false; //si el jugador esta muerto es true

var first; //si se acaba de crear un personaje o respawnear es true

//Dependiendo de la direccion a la que este mirando el usuario al iniciar el juego mostramos la brujula i guardamos el array diferente
function setDirections() {
  let bruixula = document.getElementById("agulla");
  switch (player.direction) {
    case "N":
      directions = ["N", "O", "S", "E"];
      angle = 0;
      break;
    case "O":
      directions = ["O", "S", "E", "N"];
      angle = -90;
      break;
    case "S":
      directions = ["S", "E", "N", "O"];
      angle = 180;
      break;
    case "E":
      directions = ["E", "N", "O", "S"];
      angle = 90;
      break;
  }
  bruixula.style.transform = "rotate(" + angle + "deg)";
}

//Se ejecuta al empezar el juego
function startGame() {
  first = true;
  //leemos el nombre que ha introducido el usuario
  var name = document.getElementById('name_field');
  spawnPlayer(name.value);
  //ocultamos el menu
  menu_inicial.style.visibility = "hidden";
  //quitamos lo que haya escrito en el field.
  name.value = '';
}

//Llamada a la api para spawnear al jugador
function spawnPlayer(nombre) {
  let url = "http://battlearena.danielamo.info/api/spawn/" + group_token + "/" + nombre;
  fetch(url, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      //guardamos la informacion del jugador
      player.token = json.token;
      player.code = json.code;
      player.nombre = nombre;
      
      //creamos el refresco
      interval = setInterval(update, 2000);
    })
    .then(function () {
      //buscamos la informacion del jugador que acabamos de crear
      getPlayer(player.token);
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para eliminar al jugador
function removePlayer(token, code) {
  var ajaxSYNC = function (url) {
    var request = function request(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("DELETE", url, false);
      return xhr.responseText;
    }

    return {
      request: request
    }
  }();
  ajaxSYNC.request("http://battlearena.danielamo.info/api/remove/b89f96ae/" + token + "/" + code);
  console.log("removed.");
}

//Llamada a la api para cojer la informacion del jugador
function getPlayer(token) {
  let url = "http://battlearena.danielamo.info/api/player/" + group_token + "/" + token;
  fetch(url, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      //guardamos la informacion del jugador
      player.attack = json.attack;
      player.defense = json.defense;
      player.direction = json.direction;
      player.image = json.image;
      player.name = json.name;
      player.object = json.object;
      player.vitalpoints = json.vitalpoints;
      player.x = json.x;
      player.y = json.y;
      player.kills = 0;
      
      //actualizamos los datos del jugador
      document.getElementById('vitalpoints').innerHTML = player.vitalpoints;
      document.getElementById('attack').innerHTML = player.attack;
      document.getElementById('defense').innerHTML = player.defense;
      document.getElementById('kills').innerHTML = player.kills;
    })
    .then(function () {
      //si es la primera vez que la llamamos, guardamos en que posicion esta la brujula
      if (first) {
        setDirections();
        first = false;
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para respawnear al jugador
function respawnPlayer(token) {
  let url = "http://battlearena.danielamo.info/api/respawn/" + group_token + "/" + token;
  fetch(url, {
    method: 'GET'
  })
    .then(function () {
      //el usuario acaba de iniciar un jugador
      first = true;
    })
    .then(function () {
      //actualizamos la informacion del jugador
      getPlayer(player.token);
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para ver la informacion mas detallada de los enemigos alrededor del jugador
function getPlayersAndObjects(token) {
  let url = "http://battlearena.danielamo.info/api/playersobjects/" + group_token + "/" + token;
  fetch(url, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      
      //Eliminamos los enemigos que teniamos en el array
      for (let i = 0; i < enemies_close.length; i++) {
        enemies_close[i].emptyEnemy();
      }
      //Guardamos los nuevos enemigos.
      for (let i = 0; i < json.enemies.length; i++) {
        enemies_close[i] = new Enemy;
        enemies_close[i].vitalpoints = json.enemies[i].vitalpoints;
        enemies_close[i].image = json.enemies[i].image;
        enemies_close[i].direction = json.enemies[i].direction;
        enemies_close[i].x = json.enemies[i].x;
        enemies_close[i].y = json.enemies[i].y;
      }
    })
    .then(function () {
      //Cuando tengamos la informacion actualizamos el mapa
      makeMap();
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para ver las posiciones de todos los enemigos en el mapa
function getMap(token) {
  let url = "http://battlearena.danielamo.info/api/map/b89f96ae/" + token;
  fetch(url, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
     
      //Eliminamos los enemigos que teniamos en el array
      for (let i = 0; i < enemies_map.length; i++) {
        enemies_map[i].emptyEnemy();
      }
      //Guardamos los nuevos enemigos.
      for (let i = 0; i < json.enemies.length; i++) {
        var new_enemy = new Enemy(json.enemies[i].direction, json.enemies[i].x, json.enemies[i].y);
        enemies_map.push(new_enemy);
      }
    })
    .then(function () {
      //Llamamos a la otra api para asegurarnos de que tenga la informacion al crear el mapa
      getPlayersAndObjects(player.token);
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para mover al jugador
function movePlayer(token, direccion) {
  let url = "http://battlearena.danielamo.info/api/move/b89f96ae/" + token + "/" + direccion;
  fetch(url, {
    method: 'GET'
  })
    .then(function () {
      //llamamos a las apis una vez se haya acabado la llamada a esta api para actualizar la informacion local. 
      getPlayersAndObjects(player.token);
      getPlayer(player.token);
    })
    .catch((error) => {
      console.log(error);
    });
}

//Llamada a la api para atacar al enemigo
function attackEnemy(token, direccion) {
  let url = "http://battlearena.danielamo.info/api/attack/b89f96ae/" + token + "/" + direccion;
  fetch(url, {
    method: 'GET'
  })
    .then(function (response) {
      
      return response.json();
    })
    .then(function (json) {
      
      //reducimos la vida del enemigo que tenemos guardado
      matar_enemy.vitalpoints = matar_enemy.vitalpoints - json;
    
      //Mostramos al jugador cuanto daño ha hecho al enemigo y reproducimos un sonido.
      var hitpoints = document.createElement("p");
      let parent = document.getElementById("enemy");
      parent.appendChild(hitpoints);
      hitpoints.style.position = "absolute";
      hitpoints.style.top = "50px";
      hitpoints.style.right = "300px";
      hitpoints.style.color = "tomato";
      hitpoints.style.fontFamily = "Garamond";
      if (json != 0) {
        hitpoints.innerHTML = "-" + json;
      } else {
        hitpoints.innerHTML = json;
      }
      hitpoints.style.fontSize = "xx-large";
      hitpoints.style.fontWeight = "bolder";
      fade(hitpoints);
      let hit_audio = new Audio('sound/hit.mp3');
      hit_audio.play();
      //Actualizamos los puntos de vida que le quedan al enemigo
      let vitalpoints = document.getElementById("vida_enemic");
      vitalpoints.innerHTML = matar_enemy.vitalpoints;
    })
    .catch((error) => {
      console.log(error);
    });
}

//Comprobamos si hay una pared frente al jugador y si la hay la mostramos
function checkParet() {
  if (player.x == 0 && player.direction == "O" || player.x == 40 && player.direction == "E" || player.y == 0 && player.direction == "S" || player.y == 40 && player.direction == "N") {
    paret.style.visibility = "visible";
    suelo.style.visibility = "hidden";
    return true;
  } else {
    paret.style.visibility = "hidden";
    suelo.style.visibility = "visible";
    return false;
  }
}

//Crea el minimapa
function makeMap() {
  var table = document.getElementById("mapa");
  var tbody = table.createTBody();
  var old_tbody = document.getElementById("tbody");
  //eliminamos el mapa anterior
  table.replaceChild(tbody, old_tbody);
  tbody.setAttribute("id", "tbody");
  //nuestro mapa es de 5x5
  for (let i = 0; i < 5; i++) {
    var new_row = tbody.insertRow(0);
    for (let j = 0; j < 5; j++) {
      var casella = new_row.insertCell(-1);
      casella.setAttribute("id", "x" + j + "y" + i);
      casella.style.width = "30px";
      casella.style.height = "30px";
      let full = true; 
      if (full) {
        //creamos una casilla con el suelo
        var empty = document.createElement("img");
        empty.src = "image/minimapa.png";
        empty.style.width = "30px";
        empty.style.height = "30px";
        empty.style.marginBottom = "none";
        casella.appendChild(empty);

      }
      //si es la casilla central añadimos el sprite del jugador mirando a la direccion apropiada
      if (i == 2 && j == 2) {
        var player_img = document.createElement("img");
        switch (directions[0]) {
          case "N":
            player_img.src = "image/player_N.png";
            break;
          case "O":
            player_img.src = "image/player_O.png";
            break;
          case "S":
            player_img.src = "image/player_S.png";
            break;
          case "E":
            player_img.src = "image/player_E.png";
            break;
        }
        player_img.style.width = "30px";
        player_img.style.height = "30px";
        player_img.style.position = "absolute";
        player_img.style.top = "50%";
        player_img.style.left = "50%";
        player_img.style.transform = "translate(-50%, -50%)";
        casella.appendChild(player_img);
        //creamos los enemigos
      }
      for (let n = 0; n < enemies_map.length; n++) {
        if (j == enemies_map[n].x - player.x + 2 && i == enemies_map[n].y - player.y + 2) {
          var enemy = document.createElement("img");
          var enemy_cont = document.createElement("div");
          if (j == 2 && i == 2) {
            enemy.src = "image/enemy_tiny.png";

          } else {
            enemy.src = "image/enemy.png";
          }
          enemy.style.width = "30px";
          enemy.style.height = "30px";
          enemy.style.position = "absolute";
          if (full) {
            enemy.style.transform = "translate(0%, -110%)";
          }
          enemy_cont.style.position = "absolute";
          enemy_cont.style.margin = "none";
          enemy_cont.style.width = "30px";
          enemy_cont.style.height = "30px";
          enemy_cont.appendChild(enemy);
          casella.appendChild(enemy_cont);
        }
      }
    }
  }
}

//Comprueba si hay enemigo en frente del usuario y si lo hay lo muestra.
function displayEnemy() {
  for (let i = 0; i < enemies_close.length; i++) {
    if (((enemies_close[i].x == player.x + 1 && enemies_close[i].y == player.y && directions[0] == "E") ||
      (enemies_close[i].x == player.x - 1 && enemies_close[i].y == player.y && directions[0] == "O") ||
      (enemies_close[i].x == player.x && enemies_close[i].y == player.y + 1 && directions[0] == "N") ||
      (enemies_close[i].x == player.x && enemies_close[i].y == player.y - 1 && directions[0] == "S"))) {
      if (enemies_close[i].vitalpoints > 0) {
        var container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";

        //Mostramos la imagen del enemigo
        var enemy = document.createElement("img");
        enemy.class = "enemy_img";
        enemy.src = "characters/my_character-" + enemies_close[i].image + ".png";
        container.appendChild(enemy);

        //Mostramos cuantos puntos de vida le quedan al enemigo.
        var vitalpoints = document.createElement("p");
        vitalpoints.style.alignSelf = "center";
        vitalpoints.style.textAlign = "center";
        vitalpoints.style.color = "wheat";
        vitalpoints.style.fontFamily = "Garamond";
        vitalpoints.innerHTML = enemies_close[i].vitalpoints;
        vitalpoints.style.fontSize = "xx-large";
        vitalpoints.style.fontWeight = "bolder";
        vitalpoints.id = "vida_enemic";
        container.appendChild(vitalpoints);

        let parent = document.getElementById("enemy");
        parent.appendChild(container);
        combat = true;
        //Guardamos el enemigo al que nos estamos enfrentando.
        matar_enemy = { ...enemies_close[i] };
        //Si el enemigo esta muerto i no hemos visto aun
      } else if (!enemies_close[i].equals(matar_enemy)) {
        console.log("aquest enemic ja esta mort ¯\\_(ツ)_/¯");
        //Guardamos el enemigo para saber que ya lo hemos visto.
        matar_enemy = { ...enemies_close[i] };
        //Enseñamos un mensaje informando al usuario de que el enemigo esta muerto.
        var text = document.createElement("p");
        text.style.position = "absolute";
        text.style.bottom = "500px";
        text.style.textAlign = "center";
        text.style.color = "wheat";
        text.style.fontFamily = "Garamond";
        text.innerHTML = "Aquest enemic ja esta mort";
        text.style.width = "100%";
        text.style.fontSize = "xx-large";
        text.style.fontWeight = "bolder";
        document.body.appendChild(text);
        fade(text);
      }
    }
  }
}

//Controla lo que sucede al darle a una tecla.
window.addEventListener("keydown", function (event) {
  let bruixula = document.getElementById("agulla");
  var enemy = document.getElementById("enemy");
  //el usuario se puede mover aunque este en modo "combate" si esta muerto
  if (!combat || dead) {
    switch (event.code) {
      case "ArrowLeft":
      
        //rotamos las letras que hay en el array de las direcciones hacia la izquierda
        let left = directions.shift();
        directions.push(left);
        //rotamos la aguja de la brujula 
        angle -= 90;
        bruixula.style.transform = "rotate(" + angle + "deg)";
        //si esta en combate dentro del if es que esta muerto asi que eliminamos los enemigos al movernos para no verlos.
        if (combat) {
          combat = false;
          while (enemy.hasChildNodes()) {
            enemy.removeChild(enemy.firstChild);
          }
        }
        checkParet();
        break;
      case "ArrowRight":
        
        //rotamos las letras que hay en el array de las direcciones hacia la derecha
        let right = directions.pop();
        directions.unshift(right);
        //rotamos la aguja de la brujula 
        angle += 90;
        bruixula.style.transform = "rotate(" + angle + "deg)";
        //si esta en combate dentro del if es que esta muerto asi que eliminamos los enemigos al movernos para no verlos.
        if (combat) {
          combat = false;
          while (enemy.hasChildNodes()) {
            enemy.removeChild(enemy.firstChild);
          }
        }
        checkParet();
        break;
      case "ArrowUp":
        //si esta en combate dentro del if es que esta muerto asi que eliminamos los enemigos al movernos para no verlos.
        if (combat) {
          combat = false;
          while (enemy.hasChildNodes()) {
            enemy.removeChild(enemy.firstChild);
          }
        }
        //Si no hay pared, el usuario se puede mover.
        if (!checkParet()) {
          movePlayer(player.token, directions[0]);
        }
        break;
      case "ArrowDown":
        
        //si esta en combate dentro del if es que esta muerto asi que eliminamos los enemigos al movernos para no verlos.
        if (combat) {
          combat = false;
          while (enemy.hasChildNodes()) {
            enemy.removeChild(enemy.firstChild);
          }
        }
        //Si no hay pared, el usuario se puede mover.
        if (!checkParet()) {
          movePlayer(player.token, directions[2]);
        }
        break;
    }

  } else {
    if (matar_enemy.vitalpoints <= 0) {
      combat = false;
      //eliminamos el enemigo porque esta muerto
      while (enemy.hasChildNodes()) {
        enemy.removeChild(enemy.firstChild);
      }
      //Mostramos un texto informando al user que ha matado al enemigo
      var text = document.createElement("p");
      text.style.position = "absolute";
      text.style.bottom = "500px";
      text.style.textAlign = "center";
      text.style.color = "wheat";
      text.style.fontFamily = "Garamond";
      text.innerHTML = "Has matat al enemic";
      text.style.width = "100%";
      text.style.fontSize = "xx-large";
      text.style.fontWeight = "bolder";
      document.body.appendChild(text);
      fade(text);
      //augmentamos el numero de enemigos que ha matado el jugador.
      player.kills++;
      document.getElementById('kills').innerHTML = player.kills;
      let mort = document.getElementById("mort");
      mort.style.visibility = "visible";
    }

    //Se ataca con el espacio.
    if (event.code == "Space") {
      attackEnemy(player.token, directions[0]);

    }
  }
}, true);

//menu
function menu() {
  document.getElementById("myDropup").classList.toggle("show");
}

//revivir al jugador
function revivir() {
  respawnPlayer(player.token);
  getPlayer(player.token);
  console.log("revivir");
}

//remove player
function deletePlayer() {
  if (player.token != null) {
    removePlayer(player.token, player.code);
    player.emptyPlayer();
    console.log("remove");
    var table = document.getElementById("mapa");
    var tbody = table.createTBody();
    var old_tbody = document.getElementById("tbody");
    table.replaceChild(tbody, old_tbody);
    tbody.setAttribute("id", "tbody");
    angle = 0;
    var enemy = document.getElementById("enemy");
    while (enemy.hasChildNodes()) {
      enemy.removeChild(enemy.firstChild);
    }
    let bruixula = document.getElementById("agulla");
    bruixula.style.transform = "rotate(" + angle + "deg)";
    document.getElementById('vitalpoints').innerHTML = "";
    document.getElementById('attack').innerHTML = "";
    document.getElementById('defense').innerHTML = "";
    paret.style.visibility = "hidden";
    suelo.style.visibility = "visible";
    combat = false;
  } else {
    error("There's no player.");
  }
}

//Crea un mensaje de error y reproduce el sonido de error.
function error(message) {
  var text = document.createElement("p");
  text.style.position = "absolute";
  text.style.bottom = "70px";
  text.style.textAlign = "center";
  text.style.color = "red";
  text.style.fontFamily = "Garamond";
  text.innerHTML = message;
  text.style.width = "100%";
  text.style.fontSize = "xx-large";
  text.style.fontWeight = "bolder";
  document.body.appendChild(text);
  fade(text);
  let error_audio = new Audio('sound/error_sound.mp3');
  error_audio.play();
}

//crea una animacion en la que se va desvaneciendo el elemento y luego se elimina.
function fade(element) {
  var op = 1;
  var timer = setInterval(function () {
    if (op <= 0.1) {
      clearInterval(timer);
      element.parentElement.removeChild(element);
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.1;
  }, 100);
}

//Funcion que oculta la pestaña de menu inicial
function nuevo(menu_inicial) {
  if (player.token == null) {
    var mi = document.getElementById(menu_inicial);
    if (mi.style.visibility == "hidden") {
      mi.style.visibility = 'visible';
    }
  } else {
    console.log("there's already a player");
  }
}

//Cierre del submenu cuando salimos del menu
window.onclick = function (event) {
  if (!event.target.matches('.drop-button')) {
    var dropup = document.getElementsByClassName("dropup-content");
    var i;
    for (i = 0; i < dropup.length; i++) {
      var openDropup = dropup[i];
      if (openDropup.classList.contains('show')) {
        openDropup.classList.remove('show');
      }
    }
  }
}

//Se llama cada 2 segundos mientras hay un jugador para actualitzar la informacion
function update() {
  var interval;
  if (player.token != null) {
    getMap(player.token);
    getPlayer(player.token);
    if (!combat) { //si el jugador no esta en combate, miramos si hay algun enemigo delante suyo.
      displayEnemy();
    }
  } else {
    clearInterval(interval); //si no hay jugador, dejamos de llamar a esta funcion
  }
  if (player.vitalpoints < 0 && dead == false) {
    console.log("you dead");
    dead = true;
  }
}