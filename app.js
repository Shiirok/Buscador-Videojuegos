// Llamada a la api
const fetchData = async (searchTerm) => {
  const response = await axios.get(`https://api.rawg.io/api/games`, {
    params: {
      page_size: "3",
      search: searchTerm
    }
  });
  if (response.data.count === 0) {
    console.log("error");
  }
  return response.data.results;
};

// Autocompletar
const root = document.querySelector(".autocomplete");
root.innerHTML = `
<div ></div>
<label class="has-text-white"><b>Search</b></label>
<input class="input" />

<div class="dropdown">
  <div class="dropdown-menu">
    <div class="dropdown-content results"></div>
  </div>
</div>
<div>
  <p class="has-text-white mt-3 h4"> Busca un videojuego, por ejemplo: Cyberpunk 2077, Frostpunk, Grand Theft Auto V</p>
</div>
`;
const input = document.querySelector("input");
const dropdown = document.querySelector(".dropdown");
const resultsWraper = document.querySelector(".results");

// Delay para que no haga requests todo el rato cada vez que escribas
const fetchDelay = (func, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) {
      clearInterval(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// Funcion que hace la llamada una vez escribamos
const onInput = async (event) => {
  const games = await fetchData(event.target.value);
  if (event.target.value === "" || event.target.value === " ") {
    dropdown.classList.remove("is-active");
    return;
  }

  resultsWraper.innerHTML = " "; //<= limpiamos cada vez que se haga un input nuevo
  dropdown.classList.add("is-active");

  // Creamos un dropdown menu con las opciones que traiga la api
  for (let game of games) {
    const option = document.createElement("a");
    const imgSrc = game.background_image === null ? "" : game.background_image;
    option.classList.add("dropdown-item");
    option.innerHTML = `
    <img src="${imgSrc}" class="render-image"/>
    ${game.name}
    `;
    // Manejamos el click en una de las opciones
    option.addEventListener("click", () => {
      dropdown.classList.remove("is-active");
      input.value = game.name;

      onGameSelect(game);
    });

    resultsWraper.appendChild(option);
  }
};

input.addEventListener("input", fetchDelay(onInput, 500));

// Cerramos el dropdown si el usuario hace click fuera de este
document.addEventListener("click", (event) => {
  if (!root.contains(event.target)) {
    dropdown.classList.remove("is-active");
  }
});
// Cuando hacemos click en un juego, hacemos la segunda llamada, con el nombre del juego para datos mas precisos
const onGameSelect = async (game) => {
  const response = await axios.get(`https://api.rawg.io/api/games/${game.slug}`);
  if (response.data.clip === null) {
    console.log("error");
  }

  document.querySelector("#summary").innerHTML = gameTemplate(response.data);
  readMore();
};

const gameTemplate = (gameData) => {
  document.body.style.backgroundImage = `url("${gameData.background_image}")`;
  const clip = gameData.clip === null ? "" : gameData.clip.clip;
  return `
  <section class="overlay">
  <div class="container p-5">
    <div class="columns">
      <div class="column is-7">
      <!-- Title -->
        <h1 class="title has-text-white center h1">${gameData.name}</h1>
        <div class="columns">
          <div class="column is-6">
          <!-- Genre -->
            <div class="has-text-white">
              <h2 class="h6">Genre:</h2>
              <p class="h4"><span class="underline">${gameData.genres[0].name}</span>, <span class="underline">${gameData.genres[1].name}</span></p>
            </div>
            <!-- Launch date -->
            <div class="has-text-white mt-3">
              <h2 class="h6">Launch date:</h2>
              <p class="h4 underline">${gameData.released}</p>
            </div>
          </div>
          <div class="column is-6">
            <!-- Metacritic -->
            <article class="notification is-transparent  center">
              <p class="h6 has-text-white">Rating </br><p class="h1 has-text-white">${gameData.rating}</p></p>
            </article>
          </div>
        </div>

        <!-- Description -->
        <h2 class="has-text-white h4">Description:</h2>
        <div class="has-text-white collapse" id="description-text">
          ${gameData.description}
        </div>
        <a class="button is-small is-primary is-inverted is-outlined" id="collapse-button">Read More...</a>

        <!-- Developers -->
        <div class="has-text-white mt-5">
          <p class="h4">Developers:</p>
          <p class="underline">${gameData.developers[0].name}</p>
        </div>
        
        <!-- Website -->
        <h2 class="h4 has-text-white">Website:</h2>
        <a class="has-text-white underline" target="_blank" href="${gameData.website}">${gameData.website}</a>
      </div>

      <div class="column is-5 ">
        <video autoplay muted loop src="${clip}"></video>
        <img src="${gameData.background_image_additional}" />
        <img src="${gameData.background_image}" />
      </div>
    </div>
  </div>
</section>   
`;
};

// Funcion auxiliar para desplegar la descripcion.
const readMore = () => {
  const button = document.querySelector("#collapse-button");
  button.addEventListener("click", () => {
    const description = document.querySelector("#description-text");
    if (description.classList.contains("collapse")) {
      description.classList.remove("collapse");
      button.textContent = "Show less";
    } else {
      description.classList.add("collapse");
      button.textContent = "Read More...";
    }
  });
};
